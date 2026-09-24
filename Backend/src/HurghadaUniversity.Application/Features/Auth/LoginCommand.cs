using FluentValidation;
using HurghadaUniversity.Application.Abstractions.Persistence;
using HurghadaUniversity.Application.Abstractions.Security;
using HurghadaUniversity.Application.Common.Models;
using HurghadaUniversity.Domain.Common;
using HurghadaUniversity.Domain.Enums;
using MediatR;

namespace HurghadaUniversity.Application.Features.Auth;

public sealed record LoginCommand(string Username, string Password, UserRole? PreferredRole) : IRequest<Result<AuthResponse>>;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(4);
    }
}

public sealed class LoginCommandHandler(
    IUserAccountRepository users,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator) : IRequestHandler<LoginCommand, Result<AuthResponse>>
{
    public async Task<Result<AuthResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await users.GetByUsernameAsync(request.Username, cancellationToken);
        if (user is null || !user.IsActive)
            return Result.Failure<AuthResponse>(Error.Unauthorized("Invalid credentials."));

        if (!passwordHasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<AuthResponse>(Error.Unauthorized("Invalid credentials."));

        if (request.PreferredRole is { } preferred && preferred != user.Role)
            return Result.Failure<AuthResponse>(Error.Forbidden("Selected portal does not match this account."));

        var token = tokenGenerator.Generate(new TokenUser(user.Id, user.Username, user.DisplayName, user.Role));
        return Result.Success(new AuthResponse(token, user.Id, user.Username, user.DisplayName, user.Role));
    }
}
