// Global namespaces for application logic and services
global using GlobalAdminAPIs.Data;
global using GlobalAdminAPIs.Extensions;
global using GlobalAdminAPIs.Services;
global using GlobalAdminAPIs.MappingProfiles;
global using GlobalAdminAPIs.Repos;
global using GlobalAdminAPIs.Entities;
global using GlobalAdminAPIs.Middleware;
global using GlobalAdminAPIs.DTOs;
global using GlobalAdminAPIs.Enums;
global using GlobalAdminAPIs.Config;
global using GlobalAdminAPIs.Attributes;
global using GlobalAdminAPIs.Utils;

// ASP.NET Core namespaces
global using Microsoft.AspNetCore.CookiePolicy;
global using Microsoft.AspNetCore.Mvc;
global using Microsoft.AspNetCore.Authentication.Cookies;
global using Microsoft.AspNetCore.Authentication.JwtBearer;
global using Microsoft.OpenApi.Models;
global using Microsoft.Extensions.Caching.Memory;

// Entity Framework and Database namespaces
global using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
global using Microsoft.EntityFrameworkCore;
global using System.Linq.Expressions;

// Security and Authentication namespaces
global using Microsoft.IdentityModel.Tokens;
global using System.Security.Claims;
global using Microsoft.AspNetCore.Authorization;
global using Microsoft.AspNetCore.Mvc.Filters;

// JSON and Serialization namespaces
global using System.Text;
global using System.Text.Json;
global using System.Text.Json.Serialization;
global using System.ComponentModel;
global using System.ComponentModel.DataAnnotations;
global using System.ComponentModel.DataAnnotations.Schema;

// Network and HTTP-related namespaces
global using System.Net;
global using System.Threading.RateLimiting;

// Utility namespaces
global using Mapster;
global using Ardalis.GuardClauses;
