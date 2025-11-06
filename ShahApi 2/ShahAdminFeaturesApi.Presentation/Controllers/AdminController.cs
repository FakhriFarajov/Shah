using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShahAdminFeaturesApi.Application.Services.Interfaces;
using ShahAdminFeaturesApi.Core.DTOs.Request;

namespace ShahAdminFeaturesApi.Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("getIdByEmail/{email}")]
        public async Task<IActionResult> GetIdByEmailAsync(string email)
            => Ok(await _adminService.GetIdByEmailAsync(email));
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("getAllAdminsPaginated")]
        public async Task<IActionResult> GetAllAdminsAsync([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 5)
            => Ok(await _adminService.GetAllAdminsAsync(pageNumber, pageSize));

        
        [Authorize(Policy = "AdminPolicy")]
        [HttpGet("getProfile/{adminId}")]
        public async Task<IActionResult> GetAdminProfileByIdAsync(string adminId)
            => Ok(await _adminService.GetAdminByIdAsync(adminId));
        
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpPost("add")]
        public async Task<IActionResult> AddAdminAsync([FromBody] AddAdminRequestDTO dto)
            => Ok(await _adminService.AddAdminAsync(dto));
        
        [Authorize(Policy = "AdminPolicy")]
        [HttpPut("edit/{adminId}")]
        public async Task<IActionResult> EditAdminProfileAsync(string adminId, [FromBody] EditAdminRequestDTO dto)
            => Ok(await _adminService.EditAdminAsync(adminId, dto));

        [Authorize(Policy = "AdminPolicy")]
        [HttpDelete("delete/{adminId}")]
        public async Task<IActionResult> DeleteAdminAsync(string adminId)
            => Ok(await _adminService.DeleteAdminAsync(adminId));
    }
}
