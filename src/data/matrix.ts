export interface MatrixCity {
  cityId: number;
  cityName: string;
  restaurants: string[];
}

export const MATRIX_CITIES: MatrixCity[] = [
  { cityId: 1, cityName: "San Francisco", restaurants: ["Lemonade Stand", "Food Stand", "Food Truck", "Cafe", "Fast Food", "Drive Thru", "Restaurant"] },
  { cityId: 2, cityName: "New York", restaurants: ["Hot Dog Stand", "News Stand", "Coffee Truck", "Pizzeria", "Coffee House", "Diner"] },
  { cityId: 3, cityName: "Miami", restaurants: ["Ice Cream Stand", "Taco Stand", "Ice Cream Truck", "Mocktail Bar", "Joghurt House", "Tapas Bar", "Big Drive Thru"] },
  { cityId: 4, cityName: "Paris", restaurants: ["Ice Cream Stand", "Food Stand", "Coffee Truck", "Cafe", "Sushi Bar", "Drive Thru", "Seafood Restaurant"] },
  { cityId: 5, cityName: "London", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Cheese Shop", "Pizzeria", "Fish and Chips Shop", "Big Drive Thru"] },
  { cityId: 6, cityName: "Tokyo", restaurants: ["Dango Stand", "Big Ice Cream Stand", "Ramen Truck", "Fast Food", "Sushi Bar", "Mocktail Bar", "Restaurant"] },
  { cityId: 7, cityName: "Venice", restaurants: ["Ice Cream Stand", "Waffle Stand", "Coffee Truck", "Cafe Napolita", "Pizzeria", "Dessert Co", "Italiano"] },
  { cityId: 8, cityName: "Beirut", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Baklava Shop", "Kebab Shop", "Coffee House", "Mezze Bar"] },
  { cityId: 9, cityName: "Berlin", restaurants: ["Ice Cream Stand", "Curry Wurst Stand", "Food Truck", "Cafe", "Kebab Shop", "Sushi Bar", "Apple Juice Bar"] },
  { cityId: 10, cityName: "Oslo", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Cheese Shop", "Lobster House", "Fish and Chips Shop", "Restaurant"] },
  { cityId: 11, cityName: "Rome", restaurants: ["Ice Cream Stand", "Waffle Stand", "Coffee Truck", "Dessert Co", "Pizzeria", "Cafe Napolita", "Italiano"] },
  { cityId: 12, cityName: "Warsaw", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Cheese Shop", "Dumpling Hut", "Cafe", "The Fresh Kitchen"] },
  { cityId: 13, cityName: "Johannesburg", restaurants: ["Dango Stand", "Floral Stand", "Ice Cream Truck", "Fast Food", "Mocktail Bar", "Burrito King", "Drive Thru Take Out"] },
  { cityId: 14, cityName: "Stockholm", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Coffee House", "Lobster House", "Joghurt House", "The Fresh Kitchen"] },
  { cityId: 15, cityName: "Mexico City", restaurants: ["Ice Cream Stand", "Taco Stand", "Food Truck", "Tapas Bar", "Burrito King", "Mocktail Bar", "Drive Thru Take Out"] },
  { cityId: 16, cityName: "Portland", restaurants: ["Hot Dog Stand", "Food Stand", "Ramen Truck", "Cafe", "Joghurt House", "Lobster House", "Diner"] },
  { cityId: 17, cityName: "Toronto", restaurants: ["Ice Cream Stand", "News Stand", "Food Truck", "Fast Food", "Mocktail Bar", "Drive Thru Take Out"] },
  { cityId: 18, cityName: "Sydney", restaurants: ["Lemonade Stand", "Big Ice Cream Stand", "Ice Cream Truck", "Fish and Chips Shop", "Kebab Shop", "Cafe Napolita", "Seafood Restaurant"] },
  { cityId: 19, cityName: "Lyon", restaurants: ["Street Nuts", "Waffle Stand", "Coffee Truck", "Dessert Co", "Cheese Shop", "Drive Thru", "The Fresh Kitchen"] },
  { cityId: 20, cityName: "Glasglow", restaurants: ["Lemonade Stand", "Floral Stand", "Food Truck", "Dumpling Hut", "Fish and Chips Shop", "Burrito King", "Big Drive Thru"] },
  { cityId: 21, cityName: "Beijing", restaurants: ["Dango Stand", "News Stand", "Ramen Truck", "Pizzeria", "Sushi Bar", "Dumpling Hut", "Restaurant"] },
  { cityId: 22, cityName: "Bruges", restaurants: ["Lemonade Stand", "Big Ice Cream Stand", "Coffee Truck", "Cafe Napolita", "Baklava Shop", "Tapas Bar", "Italiano"] },
  { cityId: 23, cityName: "Istanbul", restaurants: ["Ice Cream Stand", "Floral Stand", "Ice Cream Truck", "Kebab Shop", "Coffee House", "Baklava Shop", "Mezze Bar"] },
  { cityId: 24, cityName: "Hamburg", restaurants: ["Street Nuts", "Curry Wurst Stand", "Food Truck", "Cafe", "Kebab Shop", "Sushi Bar", "Apple Juice Bar"] },
  { cityId: 25, cityName: "Zurich", restaurants: ["Hot Dog Stand", "Curry Wurst Stand", "Ramen Truck", "Cheese Shop", "Lobster House", "Fish and Chips Shop", "Restaurant"] },
  { cityId: 26, cityName: "Milan", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Dessert Co", "Pizzeria", "Cafe Napolita", "Italiano"] },
  { cityId: 27, cityName: "Budapest", restaurants: ["Dango Stand", "Waffle Stand", "Coffee Truck", "Fast Food", "Coffee House", "Drive Thru", "Mezze Bar"] },
  { cityId: 28, cityName: "Nairobi", restaurants: ["Dango Stand", "Food Stand", "Food Truck", "Joghurt House", "Tapas Bar", "Mocktail Bar", "Big Drive Thru"] },
  { cityId: 29, cityName: "Helsinki", restaurants: ["Hot Dog Stand", "News Stand", "Ice Cream Truck", "Cafe", "Cheese Shop", "Dessert Co", "The Fresh Kitchen"] },
  { cityId: 30, cityName: "Sao Paulo", restaurants: ["Ice Cream Stand", "Taco Stand", "Food Truck", "Tapas Bar", "Burrito King", "Mocktail Bar", "Drive Thru Take Out"] },
  { cityId: 31, cityName: "Seattle", restaurants: ["Lemonade Stand", "Food Stand", "Food Truck", "Cafe", "Fast Food", "Drive Thru", "Restaurant"] },
  { cityId: 32, cityName: "San Diego", restaurants: ["Hot Dog Stand", "New Stand", "Coffee Truck", "Pizzeria", "Coffee House", "Diner"] },
  { cityId: 33, cityName: "Santa Monica", restaurants: ["Ice Cream Stand", "Taco Stand", "Ice Cream Truck", "Mocktail Bar", "Joghurt House", "Tapas Bar", "Big Drive Thru"] },
  { cityId: 34, cityName: "Brussels", restaurants: ["Ice Cream Stand", "Food Stand", "Coffee Truck", "Cafe", "Sushi Bar", "Drive Thru", "Seafood Restaurant"] },
  { cityId: 35, cityName: "Luxembourg", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Cheese Shop", "Pizzeria", "Fish and Chips Shop", "Big Drive Thru"] },
  { cityId: 36, cityName: "Hong Kong", restaurants: ["Dango Stand", "Big Ice Cream Stand", "Ramen Truck", "Fast Food", "Sushi Bar", "Mocktail Bar", "Restaurant"] },
  { cityId: 37, cityName: "Treviso", restaurants: ["Ice Cream Stand", "Waffle Stand", "Coffee Truck", "Cafe Napolita", "Pizzeria", "Dessert Co", "Italiano"] },
  { cityId: 38, cityName: "Marrakesh", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Baklava Shop", "Kebab Shop", "Coffee House", "Mezze Bar"] },
  { cityId: 39, cityName: "Cologne", restaurants: ["Ice Cream Stand", "Curry Wurst Stand", "Food Truck", "Cafe", "Kebab Shop", "Sushi Bar", "Apple Juice Bar"] },
  { cityId: 40, cityName: "Tallinn", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Cheese Shop", "Lobster House", "Fish and Chips Shop", "Restaurant"] },
  { cityId: 41, cityName: "Florence", restaurants: ["Ice Cream Stand", "Waffle Stand", "Coffee Truck", "Dessert Co", "Pizzeria", "Cafe Napolita", "Italiano"] },
  { cityId: 42, cityName: "Prague", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Cheese Shop", "Dumpling Hut", "Cafe", "The Fresh Kitchen"] },
  { cityId: 43, cityName: "Cape Town", restaurants: ["Dango Stand", "Floral Stand", "Ice Cream Truck", "Fast Food", "Mocktail Bar", "Burrito King", "Drive Thru Take Out"] },
  { cityId: 44, cityName: "Copenhagen", restaurants: ["Street Nuts", "Curry Wurst Stand", "Coffee Truck", "Coffee House", "Lobster House", "Joghurt House", "The Fresh Kitchen"] },
  { cityId: 45, cityName: "Lima", restaurants: ["Ice Cream Stand", "Taco Stand", "Food Truck", "Tapas Bar", "Burrito King", "Mocktail Bar", "Drive Thru Take Out"] },
  { cityId: 46, cityName: "Los Angeles", restaurants: ["Hot Dog Stand", "Food Stand", "Ramen Truck", "Cafe", "Joghurt House", "Lobster House", "Diner"] },
  { cityId: 47, cityName: "Pittsburgh", restaurants: ["Ice Cream Stand", "News Stand", "Food Truck", "Fast Food", "Mocktail Bar", "Drive Thru Take Out"] },
  { cityId: 48, cityName: "Nassau", restaurants: ["Lemonade Stand", "Big Ice Cream Stand", "Ice Cream Truck", "Fish and Chips Shop", "Kebab Shop", "Cafe Napolita", "Seafood Restaurant"] },
  { cityId: 49, cityName: "Madrid", restaurants: ["Street Nuts", "Waffle Stand", "Coffee Truck", "Dessert Co", "Cheese Shop", "Drive Thru", "The Fresh Kitchen"] },
  { cityId: 50, cityName: "Amsterdam", restaurants: ["Lemonade Stand", "Floral Stand", "Food Truck", "Dumpling Hut", "Fish and Chips Shop", "Burrito King", "Big Drive Thru"] },
  { cityId: 51, cityName: "Seoul", restaurants: ["Dango Stand", "News Stand", "Ramen Truck", "Pizzeria", "Sushi Bar", "Dumpling Hut", "Restaurant"] },
  { cityId: 52, cityName: "Birmingham", restaurants: ["Lemonade Stand", "Big Ice Cream Stand", "Coffee Truck", "Cafe Napolita", "Baklava Shop", "Tapas Bar", "Italiano"] },
  { cityId: 53, cityName: "Cairo", restaurants: ["Ice Cream Stand", "Floral Stand", "Ice Cream Truck", "Kebab Shop", "Coffee House", "Baklava Shop", "Mezze Bar"] },
  { cityId: 54, cityName: "Frankfurt", restaurants: ["Street Nuts", "Curry Wurst Stand", "Food Truck", "Cafe", "Kebab Shop", "Sushi Bar", "Apple Juice Bar"] },
  { cityId: 55, cityName: "Quebec", restaurants: ["Hot Dog Stand", "Curry Wurst Stand", "Ramen Truck", "Cheese Shop", "Lobster House", "Fish and Chips Shop", "Restaurant"] },
  { cityId: 56, cityName: "Naples", restaurants: ["Street Nuts", "Floral Stand", "Ice Cream Truck", "Dessert Co", "Pizzeria", "Cafe Napolita", "Italiano"] },
  { cityId: 57, cityName: "Zagreb", restaurants: ["Dango Stand", "Waffle Stand", "Coffee Truck", "Fast Food", "Coffee House", "Drive Thru", "Mezze Bar"] },
  { cityId: 58, cityName: "Pretoria", restaurants: ["Dango Stand", "Food Stand", "Food Truck", "Joghurt House", "Tapas Bar", "Mocktail Bar", "Big Drive Thru"] },
  { cityId: 59, cityName: "Gothenburg", restaurants: ["Hot Dog Stand", "News Stand", "Ice Cream Truck", "Cafe", "Cheese Shop", "Dessert Co", "The Fresh Kitchen"] },
  { cityId: 60, cityName: "Santiago", restaurants: ["Ice Cream Stand", "Taco Stand", "Food Truck", "Tapas Bar", "Burrito King", "Mocktail Bar", "Drive Thru Take Out"] },
];

export const MATRIX_RESTAURANTS = ["Apple Juice Bar", "Baklava Shop", "Big Drive Thru", "Big Ice Cream Stand", "Burrito King", "Cafe", "Cafe Napolita", "Cheese Shop", "Coffee House", "Coffee Truck", "Curry Wurst Stand", "Dango Stand", "Dessert Co", "Diner", "Drive Thru", "Drive Thru Take Out", "Dumpling Hut", "Fast Food", "Fish and Chips Shop", "Floral Stand", "Food Stand", "Food Truck", "Hot Dog Stand", "Ice Cream Stand", "Ice Cream Truck", "Italiano", "Joghurt House", "Kebab Shop", "Lemonade Stand", "Lobster House", "Mezze Bar", "Mocktail Bar", "New Stand", "News Stand", "Pizzeria", "Ramen Truck", "Restaurant", "Seafood Restaurant", "Street Nuts", "Sushi Bar", "Taco Stand", "Tapas Bar", "The Fresh Kitchen", "Waffle Stand"] as string[];

export function citiesWithRestaurant(name: string): number[] {
  return MATRIX_CITIES.filter((c) => c.restaurants.includes(name)).map((c) => c.cityId);
}
