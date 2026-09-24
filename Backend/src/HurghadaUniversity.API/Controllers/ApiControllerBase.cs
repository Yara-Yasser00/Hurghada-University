using HurghadaUniversity.Domain.Common;
using Microsoft.AspNetCore.Mvc;

namespace HurghadaUniversity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult FromResult(Result result)
        => result.IsSuccess ? Ok(new { success = true }) : ToError(result.Error);

    protected IActionResult FromResult<T>(Result<T> result)
        => result.IsSuccess ? Ok(result.Value) : ToError(result.Error);

    private IActionResult ToError(Error error) => error.Code switch
    {
        "NotFound" => NotFound(new { error.Code, error.Message }),
        "Validation" => BadRequest(new { error.Code, error.Message }),
        "Conflict" => Conflict(new { error.Code, error.Message }),
        "Unauthorized" => Unauthorized(new { error.Code, error.Message }),
        "Forbidden" => StatusCode(StatusCodes.Status403Forbidden, new { error.Code, error.Message }),
        _ => BadRequest(new { error.Code, error.Message })
    };
}
