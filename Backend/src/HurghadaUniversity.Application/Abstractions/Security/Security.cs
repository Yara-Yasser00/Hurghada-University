using HurghadaUniversity.Domain.Entities;
using HurghadaUniversity.Domain.Enums;

namespace HurghadaUniversity.Application.Abstractions.Security;

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public sealed record TokenUser(Guid Id, string Username, string DisplayName, UserRole Role);

public interface IJwtTokenGenerator
{
    string Generate(TokenUser user);
}
