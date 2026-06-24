package com.smartbike.performance.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bikes")
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String model;

    @Column(name = "fuel_type", nullable = false)
    private String fuelType;

    @Column(name = "tank_capacity", nullable = false)
    private Double tankCapacity; // in liters

    // Default Constructor (required by JPA)
    public Bike() {
    }

    // Parameterized Constructor
    public Bike(String name, String model, String fuelType, Double tankCapacity) {
        this.name = name;
        this.model = model;
        this.fuelType = fuelType;
        this.tankCapacity = tankCapacity;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public Double getTankCapacity() {
        return tankCapacity;
    }

    public void setTankCapacity(Double tankCapacity) {
        this.tankCapacity = tankCapacity;
    }
}
