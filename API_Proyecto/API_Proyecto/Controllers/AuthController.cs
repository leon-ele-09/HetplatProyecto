using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using API_Proyecto.Models;
using BCrypt.Net;

namespace API_Proyecto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var person = await _context.People
                .FirstOrDefaultAsync(p => p.Email == request.Email && p.Active);

            if (person == null)
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            // Verificar password con BCrypt
            if (!BCrypt.Net.BCrypt.Verify(request.Password, person.PasswordHash))
            {
                return Unauthorized(new { message = "Email o contraseña incorrectos" });
            }

            var token = GenerateJwtToken(person);

            return Ok(new
            {
                token = token,
                userId = person.Id,
                email = person.Email
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var exists = await _context.People.AnyAsync(p => p.Email == request.Email);
            if (exists)
            {
                return BadRequest(new { message = "El email ya está registrado" });
            }

            // Hash password con BCrypt (incluye salt automáticamente)
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var person = new Person
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                PasswordHash = passwordHash,
                Active = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.People.Add(person);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(person);

            return Ok(new
            {
                token = token,
                userId = person.Id,
                email = person.Email
            });
        }

        private string GenerateJwtToken(Person person)
        {
            var securityKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, person.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, person.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(
                    double.Parse(_configuration["JwtSettings:ExpirationHours"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}