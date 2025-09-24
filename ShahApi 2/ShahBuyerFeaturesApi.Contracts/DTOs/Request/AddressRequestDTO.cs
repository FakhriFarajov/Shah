namespace ShahBuyerFeaturesApi.Contracts.DTOs.Request;

public record AddressRequestDTO
(
    string BuyerId ,
    string Street ,
    string City ,
    string State ,
    string PostalCode ,
    int Country 
);