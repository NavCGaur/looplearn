module.exports = {
    apps: [{
        name: 'looplearn-bot',
        script: 'index.js',
        instances: 1,          // Must be 1 — Baileys can't run in cluster mode
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        restart_delay: 5000,   // Wait 5s before restart on crash
        env: {
            NODE_ENV: 'production',
        },
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        error_file: './logs/err.log',
        out_file: './logs/out.log',
    }],
}
