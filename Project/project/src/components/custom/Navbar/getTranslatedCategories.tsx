//Needs to be deprecated 
export function getTranslatedCategories(t) {
    return {
        home: {
            id: 1,
            name: t("Home"),
            subcategories: [
                {
                    id: 101,
                    name: t("Furniture"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Sofa"), t("Table"), t("Chair"), t("Bed")] },
                    ],
                },
                {
                    id: 102,
                    name: t("Decor"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Wall Art"), t("Vase"), t("Clock"), t("Lamp")] },
                    ],
                },
                {
                    id: 103,
                    name: t("Lighting"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Ceiling"), t("Table"), t("Floor"), t("Outdoor")] },
                    ],
                },
            ],
        },
        man: {
            id: 2,
            name: t("Man"),
            subcategories: [
                {
                    id: 201,
                    name: t("Clothing"),
                    filters: [
                        { id: "size", name: t("Size"), options: ["S", "M", "L", "XL"] },
                    ],
                },
                {
                    id: 202,
                    name: t("Shoes"),
                    filters: [
                        { id: "size", name: t("Size"), options: ["7", "8", "9", "10", "11"] },
                    ],
                },
                {
                    id: 203,
                    name: t("Accessories"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Watch"), t("Belt"), t("Wallet")] },
                    ],
                },
            ],
        },
        woman: {
            id: 3,
            name: t("Woman"),
            subcategories: [
                {
                    id: 301,
                    name: t("Clothing"),
                    filters: [
                        { id: "size", name: t("Size"), options: ["S", "M", "L", "XL"] },
                    ],
                },
                {
                    id: 302,
                    name: t("Shoes"),
                    filters: [
                        { id: "size", name: t("Size"), options: ["5", "6", "7", "8", "9"] },
                        { id: "brand", name: t("Brand"), options: ["Zara", "H&M", "Prada"] },
                    ],
                },
                {
                    id: 303,
                    name: t("Jewelry"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Necklace", "Ring", "Earrings"] },
                        { id: "material", name: t("Material"), options: ["Gold", "Silver"] },
                    ],
                },
            ],
        },
        kids: {
            id: 4,
            name: t("Kids"),
            subcategories: [
                {
                    id: 401,
                    name: t("Clothing"),
                    filters: [
                        { id: "age", name: t("Age Group"), options: ["0-2", "3-5", "6-10"] },
                        { id: "gender", name: t("Gender"), options: ["Boys", "Girls"] },
                    ],
                },
                {
                    id: 402,
                    name: t("Toys"),
                    filters: [
                        { id: "age", name: t("Age Group"), options: ["0-2", "3-5", "6-10"] },
                        { id: "type", name: t("Type"), options: [t("Educational"), t("Outdoor"), t("Indoor")] },
                    ],
                },
                {
                    id: 403,
                    name: t("School Supplies"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Stationery"), t("Bags"), t("Lunch Box")] },
                        { id: "brand", name: t("Brand"), options: ["Crayola", "Pilot", "Staedtler"] },
                    ],
                },
            ],
        },
        electronics: {
            id: 5,
            name: t("Electronics"),
            subcategories: [
                {
                    id: 501,
                    name: t("Phones"),
                    filters: [
                        { id: "brand", name: t("Brand"), options: ["Apple", "Samsung", "Xiaomi"] },
                    ],
                },
                {
                    id: 502,
                    name: t("Laptops"),
                    filters: [
                        { id: "brand", name: t("Brand"), options: ["Dell", "HP", "Apple", "Lenovo"] },
                        { id: "price", name: t("Price Range"), options: ["Under $500", "$500 - $1500", "Above $1500"] },
                    ],
                },
                {
                    id: 503,
                    name: t("Audio"),
                    filters: [
                        { id: "type", name: t("Type"), options: [t("Headphones"), t("Speakers"), t("Earbuds")] },
                        { id: "brand", name: t("Brand"), options: ["Sony", "Bose", "JBL"] },
                    ],
                },
            ],
        },
        books: {
            id: 6,
            name: t("Books"),
            subcategories: [
                {
                    id: 601,
                    name: t("Fiction"),
                    filters: [
                        { id: "genre", name: t("Genre"), options: ["Fantasy", "Romance", "Thriller"] },
                        { id: "format", name: t("Format"), options: ["Paperback", "Hardcover", "E-book"] },
                    ],
                },
                {
                    id: 602,
                    name: t("Non-Fiction"),
                    filters: [
                        { id: "topic", name: t("Topic"), options: ["Biography", "Self-Help", "Business"] },
                        { id: "format", name: t("Format"), options: ["Paperback", "Hardcover", "E-book"] },
                    ],
                },
                {
                    id: 603,
                    name: t("Comics"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Manga", "Graphic Novel", "Superhero"] },
                        { id: "age", name: t("Audience"), options: ["Kids", "Teens", "Adults"] },
                    ],
                },
            ],
        },
        beauty: {
            id: 7,
            name: t("Beauty"),
            subcategories: [
                {
                    id: 701,
                    name: t("Makeup"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Lipstick", "Foundation", "Mascara"] },
                        { id: "brand", name: t("Brand"), options: ["Maybelline", "L'Oreal", "MAC"] },
                    ],
                },
                {
                    id: 702,
                    name: t("Skincare"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Moisturizer", "Serum", "Cleanser"] },
                        { id: "brand", name: t("Brand"), options: ["Neutrogena", "Olay", "Clinique"] },
                    ],
                },
                {
                    id: 703,
                    name: t("Fragrances"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Perfume", "Cologne", "Body Mist"] },
                        { id: "brand", name: t("Brand"), options: ["Chanel", "Dior", "Gucci"] },
                    ],
                },
            ],
        },
        sports: {
            id: 8,
            name: t("Sports"),
            subcategories: [
                {
                    id: 801,
                    name: t("Fitness Equipment"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Treadmill", "Dumbbells", "Yoga Mat"] },
                        { id: "brand", name: t("Brand"), options: ["Nike", "Adidas", "Reebok"] },
                    ],
                },
                {
                    id: 802,
                    name: t("Outdoor Sports"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Camping", "Cycling", "Fishing"] },
                        { id: "brand", name: t("Brand"), options: ["Coleman", "Shimano"] },
                    ],
                },
                {
                    id: 803,
                    name: t("Team Sports"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Soccer", "Basketball", "Baseball"] },
                        { id: "brand", name: t("Brand"), options: ["Adidas", "Nike"] },
                    ],
                },
            ],
        },
        toys: {
            id: 9,
            name: t("Toys"),
            subcategories: [
                {
                    id: 901,
                    name: t("Action Figures"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Superhero", "Anime", "Movie"] },
                        { id: "brand", name: t("Brand"), options: ["Hasbro", "Mattel"] },
                    ],
                },
                {
                    id: 902,
                    name: t("Puzzles"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Jigsaw", "3D", "Wooden"] },
                        { id: "age", name: t("Age Group"), options: ["Kids", "Adults"] },
                    ],
                },
                {
                    id: 903,
                    name: t("Educational Toys"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["STEM", "Language", "Creative"] },
                        { id: "age", name: t("Age Group"), options: ["Preschool", "Elementary"] },
                    ],
                },
            ],
        },
        home_kitchen: {
            id: 10,
            name: t("Home & Kitchen"),
            subcategories: [
                {
                    id: 1001,
                    name: t("Kitchen Appliances"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Microwave", "Blender", "Coffee Maker"] },
                        { id: "brand", name: t("Brand"), options: ["Philips", "KitchenAid"] },
                    ],
                },
                {
                    id: 1002,
                    name: t("Cookware"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Pots", "Pans", "Utensils"] },
                        { id: "brand", name: t("Brand"), options: ["Tefal", "Prestige"] },
                    ],
                },
                {
                    id: 1003,
                    name: t("Bedding"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Sheets", "Blankets", "Pillows"] },
                        { id: "material", name: t("Material"), options: ["Cotton", "Silk", "Polyester"] },
                    ],
                },
            ],
        },
        health: {
            id: 11,
            name: t("Health"),
            subcategories: [
                {
                    id: 1101,
                    name: t("Personal Care"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Toothpaste", "Shampoo", "Deodorant"] },
                        { id: "brand", name: t("Brand"), options: ["Colgate", "Dove"] },
                    ],
                },
                {
                    id: 1102,
                    name: t("Medical Supplies"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Bandages", "Thermometers", "First Aid"] },
                        { id: "brand", name: t("Brand"), options: ["3M", "Omron"] },
                    ],
                },
                {
                    id: 1103,
                    name: t("Nutrition"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Vitamins", "Supplements", "Protein"] },
                        { id: "brand", name: t("Brand"), options: ["GNC", "Herbalife"] },
                    ],
                },
            ],
        },
        automotive: {
            id: 12,
            name: t("Automotive"),
            subcategories: [
                {
                    id: 1201,
                    name: t("Car Accessories"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Seat Covers", "Floor Mats", "Car Audio"] },
                        { id: "brand", name: t("Brand"), options: ["Ford", "Toyota", "Honda"] },
                    ],
                },
                {
                    id: 1202,
                    name: t("Motorcycle Parts"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Helmets", "Brakes", "Mirrors"] },
                        { id: "brand", name: t("Brand"), options: ["Yamaha", "Suzuki"] },
                    ],
                },
                {
                    id: 1203,
                    name: t("Tools & Equipment"),
                    filters: [
                        { id: "type", name: t("Type"), options: ["Wrenches", "Jacks", "Battery Chargers"] },
                        { id: "brand", name: t("Brand"), options: ["Bosch", "Makita"] },
                    ],
                },
            ],
        },
    };
}
