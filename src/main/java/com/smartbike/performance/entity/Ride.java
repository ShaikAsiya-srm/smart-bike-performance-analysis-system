package com.smartbike.performance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "rides")
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bike_id", nullable = false)
    private Bike bike;

    @Column(nullable = false)
    private Double distance; // in kilometers

    @Column(name = "duration_hours", nullable = false)
    private Double durationHours; // in hours

    @Column(name = "fuel_consumed", nullable = false)
    private Double fuelConsumed; // in liters

    @Column(name = "fuel_price_per_liter", nullable = false)
    private Double fuelPricePerLiter; // fuel price

    @Column(name = "max_speed", nullable = false)
    private Double maxSpeed; // in km/h

    // Calculated fields stored in database
    @Column(name = "mileage")
    private Double mileage; // distance / fuelConsumed

    @Column(name = "fuel_cost")
    private Double fuelCost; // fuelConsumed * fuelPricePerLiter

    @Column(name = "cost_per_km")
    private Double costPerKm; // fuelCost / distance

    @Column(name = "average_speed")
    private Double averageSpeed; // distance / durationHours

    // Default Constructor
    public Ride() {
    }

    // Parameterized Constructor
    public Ride(Bike bike, Double distance, Double durationHours, Double fuelConsumed, Double fuelPricePerLiter, Double maxSpeed) {
        this.bike = bike;
        this.distance = distance;
        this.durationHours = durationHours;
        this.fuelConsumed = fuelConsumed;
        this.fuelPricePerLiter = fuelPricePerLiter;
        this.maxSpeed = maxSpeed;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Bike getBike() {
        return bike;
    }

    public void setBike(Bike bike) {
        this.bike = bike;
    }

    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Double getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Double durationHours) {
        this.durationHours = durationHours;
    }

    public Double getFuelConsumed() {
        return fuelConsumed;
    }

    public void setFuelConsumed(Double fuelConsumed) {
        this.fuelConsumed = fuelConsumed;
    }

    public Double getFuelPricePerLiter() {
        return fuelPricePerLiter;
    }

    public void setFuelPricePerLiter(Double fuelPricePerLiter) {
        this.fuelPricePerLiter = fuelPricePerLiter;
    }

    public Double getMaxSpeed() {
        return maxSpeed;
    }

    public void setMaxSpeed(Double maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    public Double getMileage() {
        return mileage;
    }

    public void setMileage(Double mileage) {
        this.mileage = mileage;
    }

    public Double getFuelCost() {
        return fuelCost;
    }

    public void setFuelCost(Double fuelCost) {
        this.fuelCost = fuelCost;
    }

    public Double getCostPerKm() {
        return costPerKm;
    }

    public void setCostPerKm(Double costPerKm) {
        this.costPerKm = costPerKm;
    }

    public Double getAverageSpeed() {
        return averageSpeed;
    }

    public void setAverageSpeed(Double averageSpeed) {
        this.averageSpeed = averageSpeed;
    }
}
