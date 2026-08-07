package com.digitallanka.backend.config;

import com.digitallanka.backend.model.VehicleAsset;
import com.digitallanka.backend.repository.VehicleAssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private VehicleAssetRepository vehicleAssetRepository;

    @Override
    public void run(String... args) throws Exception {
        if (vehicleAssetRepository.count() == 0) {
            System.out.println("Seeding vehicle data into the database...");
            
            VehicleAsset v1 = new VehicleAsset();
            v1.setOwnerNic("197204509123");
            v1.setCustomName("Toyota Aqua");
            v1.setMake("Toyota");
            v1.setModel("Aqua");
            v1.setChassisNumber("CHA-123456789-A");
            v1.setPlateNumber("WP LA-9999");
            v1.setColor("Pearl White");
            v1.setStatus(com.digitallanka.backend.model.Asset.AssetStatus.ACTIVE);
            
            VehicleAsset v2 = new VehicleAsset();
            v2.setOwnerNic("198503402948");
            v2.setCustomName("Honda Vezel");
            v2.setMake("Honda");
            v2.setModel("Vezel");
            v2.setChassisNumber("CHA-987654321-B");
            v2.setPlateNumber("WP CAB-1234");
            v2.setColor("Black");
            v2.setStatus(com.digitallanka.backend.model.Asset.AssetStatus.ACTIVE);
            
            VehicleAsset v3 = new VehicleAsset();
            v3.setOwnerNic("199003402948");
            v3.setCustomName("Suzuki Wagon R");
            v3.setMake("Suzuki");
            v3.setModel("Wagon R");
            v3.setChassisNumber("CHA-556677889-C");
            v3.setPlateNumber("WP KD-4321");
            v3.setColor("Red");
            v3.setStatus(com.digitallanka.backend.model.Asset.AssetStatus.ACTIVE);
            
            VehicleAsset v4 = new VehicleAsset();
            v4.setOwnerNic("197204509123"); 
            v4.setCustomName("Nissan Leaf");
            v4.setMake("Nissan");
            v4.setModel("Leaf");
            v4.setChassisNumber("CHA-112233445-D");
            v4.setPlateNumber("WP KX-7777");
            v4.setColor("Silver");
            v4.setStatus(com.digitallanka.backend.model.Asset.AssetStatus.ACTIVE);

            vehicleAssetRepository.save(v1);
            vehicleAssetRepository.save(v2);
            vehicleAssetRepository.save(v3);
            vehicleAssetRepository.save(v4);
            
            System.out.println("Vehicle seeder finished.");
        }
    }
}
