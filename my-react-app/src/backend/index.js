import express from "express";
import mysql from "mysql2";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlPass03",
  database: "mydatabase",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed. Start MySQL and verify your credentials.");
    console.error(err.message);
    return;
  }

  console.log("Connected to MySQL");

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      display_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      bio TEXT,
      profile_picture_url MEDIUMTEXT,
      private BOOLEAN DEFAULT FALSE
    )
  `;

  const createForumsTable = `
    CREATE TABLE IF NOT EXISTS forums (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      owned_by INT NOT NULL,
      followers_count INT DEFAULT 0,
      forum_picture_url MEDIUMTEXT,
      FOREIGN KEY (owned_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createModeratorsTable = `
    CREATE TABLE IF NOT EXISTS moderators (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      forum_id INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
      UNIQUE KEY unique_moderator (user_id, forum_id)
    )
  `;

  const createTagsTable = `
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE
    )
  `;

  const createForumTagsTable = `
    CREATE TABLE IF NOT EXISTS forum_tags (
      forum_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (forum_id, tag_id),
      FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `;

  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      forum_id INT NOT NULL,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      likes_count INT DEFAULT 0,
      FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createPostTagsTable = `
    CREATE TABLE IF NOT EXISTS post_tags (
      post_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (post_id, tag_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `;

  const createCommentsTable = `
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      likes_count INT DEFAULT 0,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  const createLikesTable = `
    CREATE TABLE IF NOT EXISTS likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      post_id INT,
      comment_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
      CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
    )
  `;

  const createFollowedForumsTable = `
    CREATE TABLE IF NOT EXISTS followed_forums (
      user_id INT NOT NULL,
      forum_id INT NOT NULL,
      PRIMARY KEY (user_id, forum_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE
    )
  `;

  const createFriendsTable = `
    CREATE TABLE IF NOT EXISTS friends (
      user_id INT NOT NULL,
      friend_id INT NOT NULL,
      PRIMARY KEY (user_id, friend_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK (user_id <> friend_id)
    )
  `;

  const createSampleUsers = `
    INSERT IGNORE INTO users (username, display_name, email, password_hash)
    VALUES
      ('user1', 'User One', 'user1@example.com', 'password1'),
      ('user2', 'User Two', 'user2@example.com', 'password2'),
      ('user3', 'User Three', 'user3@example.com', 'password3')
  `;

  const createSampleForums = `
    INSERT IGNORE INTO forums (name, description, owned_by)
    VALUES
      ('Tech', 'Sample tech forum.', 1),
      ('Games', 'Sample games forum.', 2),
      ('Book Club', 'Sample book club forum.', 3)
  `;

  const createSampleTags = `
    INSERT IGNORE INTO tags (name)
    VALUES
      ('Technology'),
      ('Gaming'),
      ('Books'),
      ('Programming'),
      ('Movies')
  `;

  const createSampleForumTags = `
    INSERT IGNORE INTO forum_tags (forum_id, tag_id)
    VALUES
      (1, 1), -- Tech forum with Technology tag
      (1, 4), -- Tech forum with Programming tag
      (2, 2), -- Games forum with Gaming tag
      (3, 3)  -- Book Club forum with Books tag
  `;

  const createSamplePosts = `
    INSERT IGNORE INTO posts (forum_id, user_id, title, content)
    VALUES
      (1, 1, 'Welcome to the Tech Forum', 'This is a sample post in the Tech forum.'),
      (2, 2, 'Welcome to the Games Forum', 'This is a sample post in the Games forum.'),
      (3, 3, 'Welcome to the Book Club', 'This is a sample post in the Book Club forum.')
  `;

  const createSamplePostTags = `
    INSERT IGNORE INTO post_tags (post_id, tag_id)
    VALUES
      (1, 1), -- Post 1 with Technology tag
      (1, 4), -- Post 1 with Programming tag
      (2, 2), -- Post 2 with Gaming tag
      (3, 3)  -- Post 3 with Books tag
  `;

  const createSampleComments = `
    INSERT IGNORE INTO comments (post_id, user_id, content)
    VALUES
      (1, 2, 'This is a comment on the Tech forum post.'),
      (2, 3, 'This is a comment on the Games forum post.'),
      (3, 1, 'This is a comment on the Book Club post.')
  `;

  db.query(createUsersTable, (error) => {
    if (error) {
      console.error("Error creating users table:", error);
      return;
    }
    console.log("users table ready");
  });

  db.query(createForumsTable, (error) => {
    if (error) {
      console.error("Error creating forums table:", error);
      return;
    }
    console.log("forums table ready");
  });

  db.query(createModeratorsTable, (error) => {
    if (error) {
      console.error("Error creating moderators table:", error);
      return;
    }
    console.log("moderators table ready");
  });

  db.query(createTagsTable, (error) => {
    if (error) {
      console.error("Error creating tags table:", error);
      return;
    }
    console.log("tags table ready");
  });

  db.query(createForumTagsTable, (error) => {
    if (error) {
      console.error("Error creating forum_tags table:", error);
      return;
    }
    console.log("forum_tags table ready");
  });

  db.query(createPostsTable, (error) => {
    if (error) {
      console.error("Error creating posts table:", error);
      return;
    }
    console.log("posts table ready");
  });

  db.query(createPostTagsTable, (error) => {
    if (error) {
      console.error("Error creating post_tags table:", error);
      return;
    }
    console.log("post_tags table ready");
  });

  db.query(createCommentsTable, (error) => {
    if (error) {
      console.error("Error creating comments table:", error);
      return;
    }
    console.log("comments table ready");
  });

  db.query(createLikesTable, (error) => {
    if (error) {
      console.error("Error creating likes table:", error);
      return;
    }
    console.log("likes table ready");
  });

  db.query(createFollowedForumsTable, (error) => {
    if (error) {
      console.error("Error creating followed_forums table:", error);
      return;
    }
    console.log("followed_forums table ready");
  });

  db.query(createFriendsTable, (error) => {
    if (error) {
      console.error("Error creating friends table:", error);
      return;
    }
    console.log("friends table ready");
  });

  db.query(createSampleUsers, (error) => {
    if (error) {
      console.error("Error creating sample users:", error);
      return;
    }
    console.log("Sample users created");
  });

  db.query(createSampleForums, (error) => {
  if (error) {
    console.error("Error creating sample forums:", error);
    return;
  }
  console.log("Sample forums created");
});

db.query(createSampleTags, (error) => {
  if (error) {
    console.error("Error creating sample tags:", error);
    return;
  }
  console.log("Sample tags created");
});

db.query(createSampleForumTags, (error) => {
  if (error) {
    console.error("Error creating sample forum_tags:", error);
    return;
  }
  console.log("Sample forum_tags created");
});

db.query(createSamplePosts, (error) => {
  if (error) {
    console.error("Error creating sample posts:", error);
    return;
  }
  console.log("Sample posts created");
});

db.query(createSamplePostTags, (error) => {
  if (error) {
    console.error("Error creating sample post_tags:", error);
    return;
  }
  console.log("Sample post_tags created");
});

db.query(createSampleComments, (error) => {
  if (error) {
    console.error("Error creating sample comments:", error);
    return;
  }
  console.log("Sample comments created");
});
});

app.get("/", (req, res) => {
  res.json("Hello from the backend!");
});

app.get("/users", (req, res) => {
  const q = "SELECT * FROM users";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Failed to fetch users:", err.message);
      return res.status(500).json({ error: "Unable to read users from the database." });
    }
    return res.json(data);
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});
