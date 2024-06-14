const Sequelize = require('sequelize');
const db = require('./db.js');

const Advertences = db.define('advertences', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    adv_level: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, {timestamps: false});

const Advertences_roles = db.define('advertence_roles', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    adv_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    role_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {timestamps: false});

const Bans = db.define('bans', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    reason: {
        type: Sequelize.STRING
    },
    author_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author_username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {timestamps: false});

const Colors = db.define('colors', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price_ficha_comum: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    price_ficha_rara: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {timestamps: false});

const Color_inventory = db.define('color_inventory', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    role_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    equiped: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {timestamps: false});

const Daily = db.define('daily', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    num_dailies: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
    }
}, {timestamps: false});

const Embeds = db.define('embeds', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    color: {
        type: Sequelize.STRING,
        allowNull: false
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {timestamps: false});

const Guild_vars = db.define('guild_vars', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    prefix: {
        type: Sequelize.STRING,
        defaultValue: '.'
    },
    welcome_chat: {
        type: Sequelize.STRING
    },
    exit_chat: {
        type: Sequelize.STRING
    },
    log_chat: {
        type: Sequelize.STRING
    },
    muted_role: {
        type: Sequelize.STRING
    },
    join_role: {
        type: Sequelize.STRING
    },
    auto_shuffle: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'english'
    }
}, {timestamps: false});

const Kicks = db.define('kicks', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    reason: {
        type: Sequelize.STRING
    },
    author_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author_username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {timestamps: false});

const Level_rewards = db.define('level_rewards', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    level_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    reward_type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.STRING
    }
}, {timestamps: false});

const Rep = db.define('rep', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    num_reps: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        onUpdate: Sequelize.NOW
    }
}, {timestamps: false});

const Ships = db.define('ships', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user1: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user2: {
        type: Sequelize.STRING,
        allowNull: false
    },
    value: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {timestamps: false});

const Users = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ficha_comum: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    ficha_rara: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rep: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: Sequelize.STRING
    },
    vip: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    twitch_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    twitch_username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    twitch_access_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    twitch_refresh_token: {
        type: Sequelize.STRING,
        allowNull: true
    },
    guild_id: {
        type: Sequelize.STRING
    },
    channel_id: {
        type: Sequelize.STRING
    },
    last_stream_id: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {timestamps: false});

const Users_level = db.define('users_level', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    xp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    colorfree: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    muted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {timestamps: false});

const Vip_role = db.define('vip_role', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {timestamps: false});

const Xp_channels = db.define('xp_channels', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    channel_id: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {timestamps: false});

const Xp_roles = db.define('xp_roles', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    role_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    xp: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {timestamps: false});

module.exports = {
    Advertences,
    Advertences_roles,
    Bans,
    Colors,
    Color_inventory,
    Daily,
    Embeds,
    Guild_vars,
    Kicks,
    Level_rewards,
    Rep,
    Ships,
    Users,
    Users_level,
    Vip_role,
    Xp_channels,
    Xp_roles
}