import pg from 'pg';
/* import ssh2 from 'ssh2';

const Client = pg.Client;
const ClientSSH = ssh2.Client;

const sshConfig = {
    host: '95.163.243.156',
    port: 22,
    username: 'postgres',
    password: '9293709',
};

// Конфигурация подключения к PostgreSQL
const pgConfig = {
    user: 'postgres',
    host: 'localhost', // Это localhost, потому что мы создаем туннель
    database: 'bee_db',
    password: '9293709',
    port: 5432, // Порт PostgreSQL
};

const sshClient = new ClientSSH();
sshClient.on('ready', () => {
    console.log('SSH connection established.');

    // Создаем подключение к PostgreSQL через SSH
    const pgClient = new Client(pgConfig);

    pgClient.connect((err) => {
        if (err) {
            console.error('Error connecting to PostgreSQL:', err);
            pgClient.end();
            sshClient.end();
            return;
        }

        console.log('Connected to PostgreSQL.');

        // Теперь вы можете выполнять запросы к базе данных
        pgClient.query('SELECT * FROM your_table', (queryErr, result) => {
            if (queryErr) {
                console.error('Error executing query:', queryErr);
            } else {
                console.log('Query result:', result.rows);
            }

            // Закрываем соединения
            pgClient.end();
            sshClient.end();
        });
    });
});

sshClient.connect(sshConfig); */

const pool = new pg.Pool({
    user: 'postgres',
    host: 'localhost',
    //host: '95.163.243.156',
    database: 'bee_db',
    password: '9293709',
    port: 5432,
});
const client = await pool.connect();

export default client;
