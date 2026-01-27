const { sequelize } = require('./config/db');
const { User, Customer, Policy } = require('./models');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Sync models (force: true will drop tables!) - Use carefully. 
    // For now, we assume tables exist or alter is enough.
    await sequelize.sync({ alter: true });

    // Check if admin exists
    const adminExists = await User.findOne({ where: { email: 'admin@massmutual.com' } });
    
    if (!adminExists) {
      // Create Admin User
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@massmutual.com',
        password: hashedPassword, // Manually hashing since we might bypass hooks if using bulkCreate, but create uses hooks? 
        // Actually User model has hooks. But let's pass plain password if hooks handle it.
        // Wait, my User model hooks handle hashing on creation.
        // Let's pass the plain password and let the hook hash it?
        // Let's check User.js... yes, beforeCreate hashes it.
        // So I should pass 'password123' directly.
        // But wait, if I pass 'password123', the hook will hash it.
        // If I pass hashed password, the hook will hash the hash!
        // So I should pass 'password123'.
        // BUT, I need to be sure. Let's look at User.js again.
        // if (user.password) ... user.password = await bcrypt.hash(user.password, salt);
        // Yes. So I will pass plain text.
        role: 'admin'
      });
      // Actually, passing plain password to create() triggers the hook.
      // So I will fix the code below to pass plain password.
      console.log('Admin user created: admin@massmutual.com / password123');
    } else {
      console.log('Admin user already exists.');
    }

    // Create a Demo Customer
    const customer = await Customer.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0199',
      address: '123 Main St, Springfield'
    });
    console.log('Demo customer created.');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
};

// We need to modify the User creation to rely on the hook
// Re-writing the seed function properly
const runSeed = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        const adminExists = await User.findOne({ where: { email: 'admin@massmutual.com' } });
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: 'admin@massmutual.com',
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin created');
        }

        const customerExists = await Customer.findOne({ where: { email: 'john@example.com' } });
        if (!customerExists) {
             await Customer.create({
                name: 'John Doe',
                email: 'john@example.com',
                phone: '555-0199',
                address: '123 Main St, Springfield'
            });
            console.log('Customer created');
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

runSeed();
