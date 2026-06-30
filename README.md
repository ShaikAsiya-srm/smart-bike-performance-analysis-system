# Smart Bike Performance Analysis System (Backend)

The **Smart Bike Performance Analysis System** is a full-stack IoT telemetry and performance analytics system. It allows smart bike owners and fleet operators to register bikes, log ride data, automatically calculate key performance metrics (mileage, average speed, fuel cost, cost per km), and view individual bike performance statistics.

---

## 🚀 Technology Stack
*   **Java 17**: Core programming language.
*   **Spring Boot 3.2.5**: Framework for creating clean, RESTful APIs.
*   **Spring Data JPA (Hibernate)**: Object-Relational Mapping (ORM) to interact with the database without writing manual SQL.
*   **MySQL**: Relational database to persist bike and ride telemetry logs.
*   **Maven**: Dependency management and build tool.

---

## 📁 Backend Directory Structure

The backend code is organized into a clean **Layered Architecture (3-Tier)**:

```text
src/main/java/com/smartbike/performance/
│
├── SmartBikeApplication.java            # Main entry point to run the Spring Boot app
│
├── entity/                             # Database models mapping to MySQL tables
│   ├── Bike.java
│   └── Ride.java
│
├── repository/                         # Interfaces handling database CRUD queries
│   ├── BikeRepository.java
│   └── RideRepository.java
│
├── dto/                                # Data Transfer Objects for API formatting
│   └── BikePerformanceReport.java
│
├── service/                            # Business logic and telemetry calculations
│   ├── BikeService.java
│   └── RideService.java
│
├── controller/                         # REST Controller endpoints exposing APIs
│   ├── BikeController.java
│   └── RideController.java
│
└── exception/                          # Global exception interceptor
    └── GlobalExceptionHandler.java
```

---

## 🏗️ Explanation of Backend Layers

### 1. Entity Layer (`entity`)
Entities are standard Java classes mapped to database tables.
*   **`Bike.java`**: Represents a smart bike. It maps to the `bikes` table in MySQL and holds information like the bike's name, model, fuel type (e.g., Petrol/Diesel/Electric), and tank capacity.
*   **`Ride.java`**: Represents a single run/trip taken by a bike. It maps to the `rides` table. It has a `@ManyToOne` relationship pointing to the `Bike` entity. It stores user-provided telemetry (distance, duration, fuel consumed, fuel price, and max speed) alongside calculations (mileage, fuel cost, cost per km, and average speed).

### 2. Repository Layer (`repository`)
Repositories interact with the database. By extending `JpaRepository`, Spring Boot automatically implements common queries (such as save, find by ID, delete, and list all).
*   **`BikeRepository.java`**: Simple CRUD interface.
*   **`RideRepository.java`**: Custom finder method `findByBikeId(Long bikeId)` to load all rides belonging to a specific bike.

### 3. Service Layer (`service`)
This is where the calculations and validation rules are written.
*   **`BikeService.java`**: Manages bike registration and retrievals.
*   **`RideService.java`**: 
    *   When saving a ride, it automatically computes and rounds the following:
        *   **Mileage**: $$\text{Distance (km)} \div \text{Fuel Consumed (Liters)}$$
        *   **Fuel Cost**: $$\text{Fuel Consumed (Liters)} \times \text{Fuel Price per Liter}$$
        *   **Cost per KM**: $$\text{Fuel Cost} \div \text{Distance (km)}$$
        *   **Average Speed**: $$\text{Distance (km)} \div \text{Duration (hours)}$$
    *   When requesting the **Performance Report**, it aggregates all rides for a bike to calculate:
        *   Total distance, total fuel consumed, and total cost.
        *   Overall average mileage, average cost per km, and average speed.
        *   Maximum speed recorded across all rides.

### 4. DTO Layer (`dto`)
*   **`BikePerformanceReport.java`**: Used to return a formatted JSON response that contains the overall statistics of a bike's performance without returning database raw objects.

### 5. Controller Layer (`controller`)
This layer defines the URLs (endpoints) that the frontend apps or Postman can call.
*   **`BikeController.java`**: Exposes `/api/bikes` to add, list, and fetch bikes.
*   **`RideController.java`**: Exposes `/api/rides` to log rides, view rides, and load reports.

---

## 🗄️ Database Tables Schema

Spring Boot automatically generates these tables in MySQL:

### 1. `bikes` Table
```sql
CREATE TABLE bikes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    fuel_type VARCHAR(255) NOT NULL,
    tank_capacity DOUBLE NOT NULL
);
```

### 2. `rides` Table
```sql
CREATE TABLE rides (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bike_id BIGINT NOT NULL,
    distance DOUBLE NOT NULL,
    duration_hours DOUBLE NOT NULL,
    fuel_consumed DOUBLE NOT NULL,
    fuel_price_per_liter DOUBLE NOT NULL,
    max_speed DOUBLE NOT NULL,
    mileage DOUBLE,
    fuel_cost DOUBLE,
    cost_per_km DOUBLE,
    average_speed DOUBLE,
    FOREIGN KEY (bike_id) REFERENCES bikes(id)
);
```

---

## 📡 API Reference

### 1. Bike Endpoints

#### Register a Bike
*   **Method**: `POST`
*   **URL**: `/api/bikes`
*   **Request Body**:
    ```json
    {
      "name": "Royal Enfield",
      "model": "Classic 350",
      "fuelType": "Petrol",
      "tankCapacity": 13.5
    }
    ```

#### Get All Registered Bikes
*   **Method**: `GET`
*   **URL**: `/api/bikes`

---

### 2. Ride Telemetry Endpoints

#### Record a Ride (Automatically computes telemetry)
*   **Method**: `POST`
*   **URL**: `/api/rides/bike/{bikeId}` (e.g., `/api/rides/bike/1`)
*   **Request Body**:
    ```json
    {
      "distance": 120.0,
      "durationHours": 3.0,
      "fuelConsumed": 3.2,
      "fuelPricePerLiter": 105.0,
      "maxSpeed": 92.5
    }
    ```
*   **Response Body**:
    ```json
    {
      "id": 1,
      "distance": 120.0,
      "durationHours": 3.0,
      "fuelConsumed": 3.2,
      "fuelPricePerLiter": 105.0,
      "maxSpeed": 92.5,
      "mileage": 37.5,
      "fuelCost": 336.0,
      "costPerKm": 2.8,
      "averageSpeed": 40.0
    }
    ```

#### Get All Rides for a Bike
*   **Method**: `GET`
*   **URL**: `/api/rides/bike/{bikeId}`

#### Get Performance Report
*   **Method**: `GET`
*   **URL**: `/api/rides/bike/{bikeId}/report`
*   **Response Body**:
    ```json
    {
      "bikeId": 1,
      "bikeName": "Royal Enfield",
      "bikeModel": "Classic 350",
      "totalRides": 2,
      "totalDistanceKm": 270.5,
      "totalFuelConsumedLiters": 7.2,
      "totalFuelCost": 756.0,
      "averageMileageKmPerLiter": 37.57,
      "averageCostPerKm": 2.79,
      "averageSpeedKmPerHour": 41.62,
      "maxSpeedKmPerHour": 110.0
    }
    ```
