import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlPass03",
  database: "mydatabase",
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(cors());

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
      password VARCHAR(255) NOT NULL,
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
      status VARCHAR(20) NOT NULL,
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
      image_url MEDIUMTEXT,
      replies_num INT DEFAULT 0,
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
      reply_total INT DEFAULT 0,
      reply_chain_count INT DEFAULT 0,
      parent_comment_id INT DEFAULT NULL,
      reply_user_id INT DEFAULT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      likes_count INT DEFAULT 0,
      image_url MEDIUMTEXT,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
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
    INSERT IGNORE INTO users (username, display_name, email, password)
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
  const { username, email } = req.query;

  if (username) {
    const q = "SELECT id FROM users WHERE username = ?";
    db.query(q, [username], (err, data) => {
      if (err) {
        console.error("Failed search users: ", err.message);
        return res.status(500).json({ error: "Unable to check usernames." });
      }
      return res.json(data); 
    });
    return;
  }

  if (email) {
    const q = "SELECT id FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) {
        console.error("Failed search emails: ", err.message);
        return res.status(500).json({ error: "Unable to check emails." });
      }
      return res.json(data);
    });
    return;
  }

  const q = "SELECT * FROM users";
  db.query(q, (err, data) => {
    if (err) {
      console.error("Failed to get users: ", err.message);
      return res.status(500).json({ error: "Unable to retrieve users." });
    }
    return res.json(data);
  });
});

app.put("/users/:id", (req, res) => {
  const userId = req.params.id;
  const { username, display_name, email, password, profile_picture_url, bio } = req.body;

  const updates = [];
  const values = [];

  if (username !== undefined) {
    updates.push("username = ?");
    values.push(username);
  }

  if (display_name !== undefined) {
    updates.push("display_name = ?");
    values.push(display_name);
  }

  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email);
  }

  if (password !== undefined && password !== "") {
    updates.push("password = ?");
    values.push(password);
  }

  if (profile_picture_url !== undefined) {
    updates.push("profile_picture_url = ?");
    values.push(profile_picture_url);
  }

  if (bio !== undefined) {
    updates.push("bio = ?");
    values.push(bio);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No update fields provided." });
  }

  values.push(userId);
  const q = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

  db.query(q, values, (err, data) => {
    if (err) {
      console.error("Failed to update user:", err.message);
      return res.status(500).json({ error: "Unable to update user in the database." });
    }
    return res.json({ message: "User updated successfully!" });
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
    if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const q = "SELECT id, username, display_name, email, profile_picture_url, bio FROM users WHERE username = ? AND password = ?";

  db.query(q, [username, password], (err, data) => {
    if (err) {
      console.error("Login database error: ", err.message);
      return res.status(500).json({ error: "An error occurred during login." });
    }

    if (data.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    return res.json(data[0]);
  });
});
/*app.get("/users", (req, res) => {
  const { username, email } = req.query;

  if (username) {
    const q = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
    db.query(q, [username], (err, data) => {
      if (err) {
        console.error("Failed to check username:", err.message);
        return res.status(500).json({ error: "Unable to check username." });
      }
      return res.json({ exists: data[0].count > 0 });
    });
  }

  if (email) {
    const q = "SELECT COUNT(*) AS count FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) {
        console.error("Failed to check email:", err.message);
        return res.status(500).json({ error: "Unable to check email." });
      }
      return res.json({ exists: data[0].count > 0 });
    });
  }

  const q = "SELECT * FROM users";
  return db.query(q, (err, data) => {
    if (err) {
      console.error("Failed to fetch users:", err.message);
      return res.status(500).json({ error: "Unable to read users from the database." });
    }
    return res.json(data);
  });
});
*/
app.post("/users", (req, res) => {
  const q = "INSERT INTO users (`username`, `display_name`, `email`, `password`) VALUES (?)";
  const values = [
    req.body.username,
    req.body.displayName,
    req.body.email,
    req.body.password
  ];

  db.query(q, [values], (err, data) => {
    if (err) {
      console.error("Failed to create user:", err.message);
      return res.status(500).json({ error: "Unable to create user in the database." });
    }
    return res.json({ message: "User created successfully!", userId: data.insertId });
  });
});

app.post("/fetchcomments", (req, res) => {
  const { postId } = req.body;

  const q = "SELECT * FROM comments WHERE post_id = ? and parent_comment_id IS NULL ORDER BY created_at ASC";

  db.query(q, [postId], (err, data) => {
    if (err) {
      console.error("Failed to fetch comments:", err.message);
      return res.status(500).json({ error: "Unable to fetch comments from the database." });
    }
    return res.json(data);
  });
});

app.post("/fetchreplies", (req, res) => {
  const { commentId } = req.body;

  const q = "SELECT * FROM comments WHERE parent_comment_id = ? ORDER BY created_at ASC";

  db.query(q, [commentId], (err, data) => {
    if (err) {
      console.error("Failed to fetch replies:", err.message);
      return res.status(500).json({ error: "Unable to fetch replies from the database." });
    }
    return res.json(data);
  });
});

app.post("/addcomment", (req, res) => {
  const { postId, userId, content, parentCommentId } = req.body;

  const q = "INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)";

  db.query(q, [postId, userId, content, parentCommentId || null], (err, data) => {
    if (err) {
      console.error("Failed to add comment:", err.message);
      return res.status(500).json({ error: "Unable to add comment to the database." });
    }
    return res.json({ message: "Comment added successfully!", commentId: data.insertId });
  });
});

app.post("/fetchUser", (req, res) => {
  const { userId } = req.body;

  const q = "SELECT username, display_name, bio, profile_picture_url, created_at, private FROM users WHERE id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to fetch user:", err.message);
      return res.status(500).json({ error: "Unable to fetch user from the database." });
    }
    return res.json(data[0]);
  });
});

app.post("/checkmod", (req, res) => {
  const { userId, forumId } = req.body;

  const q = "SELECT status FROM moderators WHERE user_id = ? AND forum_id = ?";

  db.query(q, [userId, forumId], (err, data) => {
    if (err) {
      console.error("Failed to check moderator status:", err.message);
      return res.status(500).json({ error: "Unable to check moderator status in the database." });
    }
    return res.json({ isModerator: data.length > 0, status: data[0]?.status || null });
  });
});

app.post("/checkfriend", (req, res) => {
  const { userId, friendId } = req.body;

  const q = "SELECT * FROM friends WHERE user_id = ? AND friend_id = ?";

  db.query(q, [userId, friendId], (err, data) => {
    if (err) {
      console.error("Failed to check friendship status:", err.message);
      return res.status(500).json({ error: "Unable to check friendship status in the database." });
    }
    return res.json({ isFriend: data.length > 0 });
  });
});

app.post("/fetchforumdata", (req, res) => {
  const { forumId } = req.body;

  const q = "SELECT * FROM forums WHERE id = ?";

  db.query(q, [forumId], (err, data) => {
    if (err) {
      console.error("Failed to fetch forum:", err.message);
      return res.status(500).json({ error: "Unable to fetch forum from the database." });
    }
    return res.json(data[0]);
  });
});

app.post("/fetchpostdata", (req, res) => {
  const { postId } = req.body;

  const q = "SELECT * FROM posts WHERE id = ?";

  db.query(q, [postId], (err, data) => {
    if (err) {
      console.error("Failed to fetch post:", err.message);
      return res.status(500).json({ error: "Unable to fetch post from the database." });
    }
    return res.json(data[0]);
  });
});

app.post("/checkLiked", (req, res) => {
  const { userId, postId, commentId } = req.body;

  const q = "SELECT * FROM likes WHERE user_id = ? AND (post_id = ? OR comment_id = ?)";

  db.query(q, [userId, postId || null, commentId || null], (err, data) => {
    if (err) {
      console.error("Failed to check like status:", err.message);
      return res.status(500).json({ error: "Unable to check like status in the database." });
    }
    return res.json({ isLiked: data.length > 0 });
  });
});

app.post("/toggleLike", (req, res) => {
  const { userId, commentId, postId } = req.body;

  const checkLikeQuery = "SELECT * FROM likes WHERE user_id = ? AND (comment_id = ? OR post_id = ?)";
  const insertLikeQuery = "INSERT INTO likes (user_id, comment_id, post_id) VALUES (?, ?, ?)";
  const deleteLikeQuery = "DELETE FROM likes WHERE user_id = ? AND comment_id = ? AND post_id = ?";
  const updateCommentLikesQuery = "UPDATE comments SET likes_count = likes_count + ? WHERE id = ?";

  db.query(checkLikeQuery, [userId, commentId || null, postId || null], (err, data) => {
    if (err) {
      console.error("Failed to check like status:", err.message);
      return res.status(500).json({ error: "Unable to check like status in the database." });
    }

    if (data.length > 0) {
      // User has already liked the comment, so remove the like
      db.query(deleteLikeQuery, [userId, commentId || null, postId || null], (err) => {
        if (err) {
          console.error("Failed to remove like:", err.message);
          return res.status(500).json({ error: "Unable to remove like from the database." });
        }
      });
    } else {
      // User has not liked the comment, so add the like
      db.query(insertLikeQuery, [userId, commentId || null, postId || null], (err) => {
        if (err) {
          console.error("Failed to add like:", err.message);
          return res.status(500).json({ error: "Unable to add like to the database." });
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});

