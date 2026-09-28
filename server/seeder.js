import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Equipment from './models/Equipment.js';
import Booking from './models/Booking.js';
import Review from './models/Review.js';
import connectDB from './config/db.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Review.deleteMany();
    await Booking.deleteMany();
    await Equipment.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing database records (Users, Equipment, Bookings, Reviews)...');

    const defaultHashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Users (2 Roles: 'owner' and 'renter')
    const owner1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: defaultHashedPassword,
      phone: '9876543210',
      role: 'owner',
      location: 'Delhi',
      isEmailVerified: true,
      profileImage: '/images/avatar-rahul.jpg',
    });

    const owner2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@gmail.com',
      password: defaultHashedPassword,
      phone: '9812345678',
      role: 'owner',
      location: 'Noida',
      isEmailVerified: true,
      profileImage: '/images/avatar-priya.jpg',
    });

    const renter1 = await User.create({
      name: 'Aakash Rajawat',
      email: 'aakash@gmail.com',
      password: defaultHashedPassword,
      phone: '9123456780',
      role: 'renter',
      location: 'Faridabad',
      isEmailVerified: true,
      profileImage: '/images/avatar-aakash.jpg',
    });

    const renter2 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@gmail.com',
      password: defaultHashedPassword,
      phone: '9988776655',
      role: 'renter',
      location: 'Ghaziabad',
      isEmailVerified: true,
      profileImage: '/images/avatar-vikram.jpg',
    });

    console.log('Created Demo Users (2 Owners, 2 Renters)...');

    // 2. Create the 18 Requested Equipment Items across Delhi, Noida, Faridabad, and Ghaziabad with Real-Time GPS Coordinates
    const equipments = await Equipment.insertMany([
      // 1. JCB Backhoe Loader (Connaught Place, Delhi)
      {
        ownerId: owner1._id,
        name: 'JCB Backhoe Loader (3DX Heavy Duty)',
        category: 'Construction',
        description: 'High efficiency excavation and loading machine with certified operator. Best for foundation digging, trenching, and land leveling.',
        pricePerDay: 5500,
        securityDeposit: 15000,
        location: 'Delhi',
        latitude: 28.6315,
        longitude: 77.2167,
        locationCoordinates: { type: 'Point', coordinates: [77.2167, 28.6315] },
        image: '/images/jcb-backhoe-loader.jpg',
        availability: true,
      },
      // 2. Concrete Mixer (Sector 18, Noida)
      {
        ownerId: owner2._id,
        name: 'Concrete Mixer (10/7 Batch Hopper)',
        category: 'Construction',
        description: 'Heavy duty diesel concrete mixer machine with mechanical hopper. Ideal for residential slabs, foundation footings, and commercial casting.',
        pricePerDay: 1200,
        securityDeposit: 4000,
        location: 'Noida',
        latitude: 28.57,
        longitude: 77.32,
        locationCoordinates: { type: 'Point', coordinates: [77.32, 28.57] },
        image: '/images/concrete-mixer.jpg',
        availability: true,
      },
      // 3. Mini Excavator (Sector 15, Faridabad)
      {
        ownerId: owner1._id,
        name: 'Mini Excavator (3-Ton Compact Digger)',
        category: 'Construction',
        description: 'Compact rubber-track excavator with 360-degree zero-tail swing. Perfect for tight urban construction sites, pipe laying, and garden leveling.',
        pricePerDay: 4200,
        securityDeposit: 12000,
        location: 'Faridabad',
        latitude: 28.415,
        longitude: 77.324,
        locationCoordinates: { type: 'Point', coordinates: [77.324, 28.415] },
        image: '/images/mini-excavator.jpg',
        availability: true,
      },
      // 4. Tractor (Indirapuram, Ghaziabad)
      {
        ownerId: owner2._id,
        name: 'Tractor (Mahindra 575 DI 45HP)',
        category: 'Agriculture',
        description: 'Powerful 45 HP multi-purpose farm tractor. Equipped with hydraulic lifting for ploughing, trolley towing, and field harvesting.',
        pricePerDay: 2200,
        securityDeposit: 8000,
        location: 'Ghaziabad',
        latitude: 28.644,
        longitude: 77.375,
        locationCoordinates: { type: 'Point', coordinates: [77.375, 28.644] },
        image: '/images/tractor.jpg',
        availability: true,
      },
      // 5. Rotavator (Raj Nagar Extension, Ghaziabad)
      {
        ownerId: owner2._id,
        name: 'Rotavator (Heavy Duty 6-Feet Rotary Tiller)',
        category: 'Agriculture',
        description: '6-feet tractor-mounted rotavator with boron steel blades. Pulverizes soil efficiently for seed bed preparation in a single pass.',
        pricePerDay: 900,
        securityDeposit: 3000,
        location: 'Ghaziabad',
        latitude: 28.685,
        longitude: 77.442,
        locationCoordinates: { type: 'Point', coordinates: [77.442, 28.685] },
        image: '/images/rotavator.jpg',
        availability: true,
      },
      // 6. Water Pump (NIT Faridabad Industrial Area)
      {
        ownerId: owner1._id,
        name: 'Water Pump (Diesel 5HP, 3-Inch Delivery)',
        category: 'Agriculture',
        description: 'High-flow portable diesel engine water pump with 30m delivery hose. Designed for field irrigation, dewatering, and pond drainage.',
        pricePerDay: 600,
        securityDeposit: 1500,
        location: 'Faridabad',
        latitude: 28.398,
        longitude: 77.305,
        locationCoordinates: { type: 'Point', coordinates: [77.305, 28.398] },
        image: '/images/water-pump.jpg',
        availability: true,
      },
      // 7. Electric Drill (Karol Bagh, Delhi)
      {
        ownerId: owner1._id,
        name: 'Electric Drill (Bosch Professional 13mm Impact Kit)',
        category: 'Power Tools',
        description: 'Heavy duty reversible electric impact drill with depth stop and 15-piece masonry, metal, and wood drill bit set.',
        pricePerDay: 250,
        securityDeposit: 600,
        location: 'Delhi',
        latitude: 28.652,
        longitude: 77.19,
        locationCoordinates: { type: 'Point', coordinates: [77.19, 28.652] },
        image: '/images/electric-drill.jpg',
        availability: true,
      },
      // 8. Angle Grinder (Sector 62, Noida)
      {
        ownerId: owner2._id,
        name: 'Angle Grinder (Dewalt 4-Inch 850W)',
        category: 'Power Tools',
        description: 'High-speed angle grinder with metal cutting discs, grinding wheel, spanner, and adjustable protective guard.',
        pricePerDay: 200,
        securityDeposit: 500,
        location: 'Noida',
        latitude: 28.628,
        longitude: 77.368,
        locationCoordinates: { type: 'Point', coordinates: [77.368, 28.628] },
        image: '/images/angle-grinder.jpg',
        availability: true,
      },
      // 9. Welding Machine (Ballabgarh, Faridabad)
      {
        ownerId: owner1._id,
        name: 'Welding Machine (Inverter ARC 250A Single Phase)',
        category: 'Power Tools',
        description: 'Portable IGBT inverter welding machine with heavy duty welding cables, electrode holder, earth clamp, and auto-darkening helmet.',
        pricePerDay: 500,
        securityDeposit: 1500,
        location: 'Faridabad',
        latitude: 28.34,
        longitude: 77.32,
        locationCoordinates: { type: 'Point', coordinates: [77.32, 28.34] },
        image: '/images/welding-machine.jpg',
        availability: true,
      },
      // 10. Pressure Washer (Vaishali, Ghaziabad)
      {
        ownerId: owner2._id,
        name: 'Pressure Washer (Commercial 1800W, 140 Bar)',
        category: 'Cleaning',
        description: '140-bar high pressure jet washer with rotary dirt blaster nozzle, 10m high-pressure hose, and foam lance.',
        pricePerDay: 450,
        securityDeposit: 1000,
        location: 'Ghaziabad',
        latitude: 28.648,
        longitude: 77.34,
        locationCoordinates: { type: 'Point', coordinates: [77.34, 28.648] },
        image: '/images/pressure-washer.jpg',
        availability: true,
      },
      // 11. Industrial Vacuum Cleaner (Okhla Industrial Area, Delhi)
      {
        ownerId: owner1._id,
        name: 'Industrial Vacuum Cleaner (Heavy Duty 30L Wet & Dry)',
        category: 'Cleaning',
        description: 'Stainless steel drum industrial vacuum with dual-stage suction motor, washable HEPA filter, crevice tools, and floor squeegee.',
        pricePerDay: 400,
        securityDeposit: 1000,
        location: 'Delhi',
        latitude: 28.53,
        longitude: 77.275,
        locationCoordinates: { type: 'Point', coordinates: [77.275, 28.53] },
        image: '/images/industrial-vacuum-cleaner.jpg',
        availability: true,
      },
      // 12. Mini Truck (Sector 137 Expressway, Noida)
      {
        ownerId: owner2._id,
        name: 'Mini Truck (Tata Ace Cargo Carrier)',
        category: 'Transportation',
        description: 'Reliable small commercial cargo mini truck for local equipment transport, furniture shifting, and construction material haulage.',
        pricePerDay: 1800,
        securityDeposit: 5000,
        location: 'Noida',
        latitude: 28.508,
        longitude: 77.402,
        locationCoordinates: { type: 'Point', coordinates: [77.402, 28.508] },
        image: '/images/mini-truck.jpg',
        availability: true,
      },
      // 13. Forklift (Sector 24 Industrial Area, Faridabad)
      {
        ownerId: owner1._id,
        name: 'Forklift (3-Ton Diesel Industrial Lifter)',
        category: 'Construction',
        description: 'Heavy duty 3-ton industrial forklift with 4.5-meter duplex mast, solid tires, and hydraulic side shifter for pallet and warehouse handling.',
        pricePerDay: 3500,
        securityDeposit: 10000,
        location: 'Faridabad',
        latitude: 28.375,
        longitude: 77.318,
        locationCoordinates: { type: 'Point', coordinates: [77.318, 28.375] },
        image: '/images/forklift.jpg',
        availability: true,
      },
      // 14. Portable Generator (Sahibabad Industrial Area, Ghaziabad)
      {
        ownerId: owner2._id,
        name: 'Portable Generator (Silent Inverter 3.5 kVA)',
        category: 'Power Tools',
        description: 'Low-noise portable generator with recoil start and pure sine wave clean power for power tools, outdoor events, and site backup.',
        pricePerDay: 800,
        securityDeposit: 2500,
        location: 'Ghaziabad',
        latitude: 28.665,
        longitude: 77.35,
        locationCoordinates: { type: 'Point', coordinates: [77.35, 28.665] },
        image: '/images/portable-generator.jpg',
        availability: true,
      },
      // 15. Sound System (Saket District Centre, South Delhi)
      {
        ownerId: owner1._id,
        name: 'Sound System (2000W Professional PA Setup)',
        category: 'Event',
        description: 'Complete live event sound package including dual 15-inch active speakers, 6-channel audio mixer, 2 wireless microphones, and stands.',
        pricePerDay: 1500,
        securityDeposit: 4000,
        location: 'Delhi',
        latitude: 28.5245,
        longitude: 77.2066,
        locationCoordinates: { type: 'Point', coordinates: [77.2066, 28.5245] },
        image: '/images/sound-system.jpg',
        availability: true,
      },
      // 16. Projector (Sector 16 Film City, Noida)
      {
        ownerId: owner2._id,
        name: 'Projector (Full HD 4000 Lumens + 120" Screen)',
        category: 'Event',
        description: 'High brightness 4000 lumens projector with 120-inch foldable tripod screen, HDMI cables, and wireless screen streaming support.',
        pricePerDay: 700,
        securityDeposit: 2000,
        location: 'Noida',
        latitude: 28.568,
        longitude: 77.315,
        locationCoordinates: { type: 'Point', coordinates: [77.315, 28.568] },
        image: '/images/projector.jpg',
        availability: true,
      },
      // 17. Event Tent (Surajkund, Faridabad)
      {
        ownerId: owner1._id,
        name: 'Event Tent (Waterproof Canopy 20x20 Feet)',
        category: 'Event',
        description: 'Heavy duty galvanized steel frame event tent with UV-resistant waterproof white canopy tarpaulin and secure ground anchoring pegs.',
        pricePerDay: 1200,
        securityDeposit: 3000,
        location: 'Faridabad',
        latitude: 28.487,
        longitude: 77.283,
        locationCoordinates: { type: 'Point', coordinates: [77.283, 28.487] },
        image: '/images/event-tent.jpg',
        availability: true,
      },
      // 18. Portable Stage (Mohan Nagar, Ghaziabad)
      {
        ownerId: owner2._id,
        name: 'Portable Stage (Modular Aluminium Platform 16x12 Feet)',
        category: 'Event',
        description: 'Non-slip modular aluminium staging risers with adjustable 2ft-3ft legs, black perimeter safety skirt, and stage access stairs.',
        pricePerDay: 2500,
        securityDeposit: 6000,
        location: 'Ghaziabad',
        latitude: 28.678,
        longitude: 77.389,
        locationCoordinates: { type: 'Point', coordinates: [77.389, 28.678] },
        image: '/images/portable-stage.jpg',
        availability: true,
      },
    ]);

    console.log(`Created ${equipments.length} Equipment listings...`);

    // 3. Create Sample Bookings
    const today = new Date();
    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);
    const inFiveDays = new Date(today);
    inFiveDays.setDate(today.getDate() + 5);

    await Booking.create([
      {
        equipmentId: equipments[0]._id, // JCB Backhoe Loader
        renterId: renter1._id,
        ownerId: owner1._id,
        startDate: inTwoDays,
        endDate: inFiveDays,
        totalAmount: 16500,
        status: 'pending',
      },
      {
        equipmentId: equipments[6]._id, // Electric Drill
        renterId: renter1._id,
        ownerId: owner1._id,
        startDate: today,
        endDate: inTwoDays,
        totalAmount: 500,
        status: 'accepted',
      },
      {
        equipmentId: equipments[14]._id, // Sound System
        renterId: renter2._id,
        ownerId: owner1._id,
        startDate: inTwoDays,
        endDate: inFiveDays,
        totalAmount: 4500,
        status: 'accepted',
      },
    ]);

    console.log('Created sample bookings...');

    // 4. Seed Reviews & Ratings for Equipment Items
    const sampleReviews = [
      // JCB Backhoe Loader
      {
        equipmentId: equipments[0]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Top notch machine! The hydraulic power was exceptional and helped us finish our basement foundation digging half a day early. Highly recommended.',
      },
      {
        equipmentId: equipments[0]._id,
        userId: renter2._id,
        rating: 5,
        comment: 'Clean and well-maintained 3DX JCB with experienced certified operator. On-time delivery in central Delhi zone.',
      },
      // Concrete Mixer
      {
        equipmentId: equipments[1]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Batch hopper worked like a charm. Mixed concrete evenly for our entire roof slab casting without a hitch.',
      },
      {
        equipmentId: equipments[1]._id,
        userId: renter2._id,
        rating: 4,
        comment: 'Solid machine with reliable diesel engine. Started on first pull and fuel consumption was very economical.',
      },
      // Tractor (Mahindra 575 DI)
      {
        equipmentId: equipments[2]._id,
        userId: renter2._id,
        rating: 5,
        comment: 'Absolute beast in the field! Tilled 4 acres of farm land effortlessly. Power steering made operating for 8 hours comfortable.',
      },
      // Rotavator
      {
        equipmentId: equipments[3]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Blades were sharp and soil pulverization was superb for wheat sowing. Clean hitch attachment mechanism.',
      },
      // Electric Demolition Hammer / Drill
      {
        equipmentId: equipments[6]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Bosch quality shows! Came with genuine SDS bits and heavy duty carrying case. Handled brick wall chiseling smoothly.',
      },
      {
        equipmentId: equipments[6]._id,
        userId: renter2._id,
        rating: 4,
        comment: 'Great vibration dampening and solid motor power. Very affordable rate for a day’s interior renovation work.',
      },
      // Water Submersible Pump
      {
        equipmentId: equipments[8]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Dewatered our basement rainwater accumulation in 2 hours flat. Impressive flow rate and included heavy-duty hoses.',
      },
      // Pressure Washer
      {
        equipmentId: equipments[11]._id,
        userId: renter2._id,
        rating: 5,
        comment: 'Industrial grade 160 bar pressure was enough to strip off caked mud from our trucks. Quick disconnect fittings worked great.',
      },
      // Sound System DJ Setup
      {
        equipmentId: equipments[14]._id,
        userId: renter2._id,
        rating: 5,
        comment: 'Crystal clear treble and thumping bass for our outdoor family event! Wireless mics had zero interference.',
      },
      {
        equipmentId: equipments[14]._id,
        userId: renter1._id,
        rating: 5,
        comment: 'Super easy Bluetooth pairing and plug-and-play auxiliary setup. Owner Rahul was very polite and cooperative.',
      },
      // Canopy Party Tent
      {
        equipmentId: equipments[15]._id,
        userId: renter1._id,
        rating: 4,
        comment: 'Waterproof fabric protected our guests from sudden evening drizzle. Sturdy steel poles and clean side panels.',
      },
      // Power Trowel
      {
        equipmentId: equipments[5]._id,
        userId: renter2._id,
        rating: 5,
        comment: 'Achieved a mirror-smooth concrete warehouse floor finish. Blades were brand new and pitch adjustment was smooth.',
      },
    ];

    await Review.insertMany(sampleReviews);
    console.log(`Created ${sampleReviews.length} sample reviews & ratings...`);

    // Recalculate average ratings and total reviews for each equipment
    for (const eq of equipments) {
      const stats = await Review.aggregate([
        { $match: { equipmentId: eq._id } },
        {
          $group: {
            _id: '$equipmentId',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const averageRating =
        stats.length > 0 ? Math.round(stats[0].averageRating * 10) / 10 : 0;
      const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

      await Equipment.findByIdAndUpdate(eq._id, { averageRating, totalReviews });
    }

    console.log('Recalculated equipment ratings and review counts...');
    console.log('==================================================');
    console.log('✅ EquipLocal Database Seeded Successfully with 18 Items & Reviews!');
    console.log('Demo Credentials:');
    console.log('  Owner: rahul@gmail.com    | Password: password123');
    console.log('  Owner: priya@gmail.com    | Password: password123');
    console.log('  User:  aakash@gmail.com   | Password: password123');
    console.log('  User:  vikram@gmail.com   | Password: password123');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
