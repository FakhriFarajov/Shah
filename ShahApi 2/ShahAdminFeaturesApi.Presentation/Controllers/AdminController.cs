using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Authorize(Policy = "AdminPolicy")]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        
        
        [HttpGet("getAllAdminsPaginated")]
        public async Task<IActionResult> GetAllAdminsAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
            => Ok(await _adminService.GetAllAdminsAsync(pageNumber, pageSize));
        
        [HttpGet("getProfile/{adminId}")]
        public async Task<IActionResult> GetAdminProfileByIdAsync(string adminId)
            => Ok(await _adminService.GetAdminByIdAsync(adminId));
        
        [HttpPost("add")]
        public async Task<IActionResult> AddAdminAsync([FromBody] AddAdminRequestDTO dto)
            => Ok(await _adminService.AddAdminAsync(dto));
        
        [HttpPut("edit/{adminId}")]
        public async Task<IActionResult> EditAdminProfileAsync(string adminId, [FromBody] EditAdminRequestDTO dto)
            => Ok(await _adminService.EditAdminAsync(adminId, dto));

        [HttpDelete("delete/{adminId}")]
        public async Task<IActionResult> DeleteAdminAsync(string adminId)
            => Ok(await _adminService.DeleteAdminAsync(adminId));
    }
}
