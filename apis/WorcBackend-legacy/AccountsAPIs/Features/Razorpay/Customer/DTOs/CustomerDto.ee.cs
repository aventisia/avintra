namespace AccountsAPIs.DTOs;

 /// <summary>
 /// Provides the data required to create or update a customer record.
 /// </summary>
 public class CustomerRequestDto
 {
     /// <summary>
     /// Gets or sets the customer's full name. This field is mandatory.
     /// </summary>
     [Required]
     public required string Name { get; set; }

     /// <summary>
     /// Gets or sets the customer's primary email address. Must be a valid email format and is mandatory.
     /// </summary>
     [Required]
     [EmailAddress]
     public required string Email { get; set; }

     /// <summary>
     /// Gets or sets the customer's contact phone number.
     /// </summary>
     [Phone]
     public string? Contact { get; set; }

     /// <summary>
     /// Gets or sets the customer's Goods and Services Tax Identification Number (GSTIN).
     /// </summary>
     public string? GstNumber { get; set; }
 }


 /// <summary>
 /// Represents the data for a customer as returned by the API, providing a client-safe view of the entity.
 /// </summary>
 public class CustomerResponseDto
 {
     /// <summary>
     /// The unique identifier for the customer (e.g., "cust_xxxxxxxxxxxxxx").
     /// </summary>
     public required string Id { get; set; }

     /// <summary>
     /// The customer's full name.
     /// </summary>
     public required string Name { get; set; }

     /// <summary>
     /// The customer's primary email address.
     /// </summary>
     public required string Email { get; set; }

     /// <summary>
     /// The customer's contact phone number.
     /// </summary>
     public string? Contact { get; set; }

     /// <summary>
     /// The customer's Goods and Services Tax Identification Number (GSTIN).
     /// </summary>
     public string? GstNumber { get; set; }

     /// <summary>
     /// The customer's shipping address details.
     /// </summary>
     public CustomerAddressDto? ShippingAddress { get; set; }

     /// <summary>
     /// A Unix timestamp indicating when the customer record was created.
     /// </summary>
     public DateTimeOffset CreatedAt { get; set; }
 }

 /// <summary>
 /// Represents a physical address, used for both billing and shipping purposes.
 /// </summary>
 public class CustomerAddressDto
 {
     /// <summary>
     /// Gets or sets the primary line of the address (e.g., house number, street name). This field is mandatory.
     /// </summary>
     [Required]
     public required string Line1 { get; set; }

     /// <summary>
     /// Gets or sets the secondary line of the address (e.g., apartment, suite, landmark).
     /// </summary>
     public string? Line2 { get; set; }

     /// <summary>
     /// Gets or sets the city.
     /// </summary>
     [Required]
     public required string City { get; set; }

     /// <summary>
     /// Gets or sets the state or province.
     /// </summary>
     [Required]
     public required string State { get; set; }

     /// <summary>
     /// Gets or sets the postal or ZIP code.
     /// </summary>
     [Required]
     public required string PostalCode { get; set; }

     /// <summary>
     /// Gets or sets the country, preferably as a two-letter ISO country code (e.g., "IN").
     /// </summary>
     [Required]
     public required string Country { get; set; }
 }