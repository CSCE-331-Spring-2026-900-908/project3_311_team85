const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    rl.close();
    return;
  }

  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
    } else {
      console.log('Hashed password:', hash);
      console.log("\nNow you can use this hash to insert a user into the database, for example:");
      console.log(`INSERT INTO users (username, password_hash, role) VALUES ('manager_user', '${hash}', 'manager');`);
    }
    rl.close();
  });
});