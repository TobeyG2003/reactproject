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
      private BOOLEAN DEFAULT FALSE,
      friends_count INT DEFAULT 0
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
      status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
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

  db.query(
    "ALTER TABLE comments ADD COLUMN IF NOT EXISTS reply_chain_count INT DEFAULT 0",
    (err) => {
      if (err) {
        // Fallback for MySQL versions that don't support IF NOT EXISTS: check INFORMATION_SCHEMA
        const schema = (db.config && db.config.database) || "mydatabase";
        const checkColumnQ = `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'comments' AND COLUMN_NAME = 'reply_chain_count'`;
        db.query(checkColumnQ, [schema], (chkErr, rows) => {
          if (chkErr) {
            console.error("Failed to check for reply_chain_count column:", chkErr.message);
            return;
          }
          if (rows && rows[0] && rows[0].cnt === 0) {
            db.query("ALTER TABLE comments ADD COLUMN reply_chain_count INT DEFAULT 0", (addErr) => {
              if (addErr) console.error("Failed to add reply_chain_count column to comments:", addErr.message);
            });
          }
        });
      }
    }
  );

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

  db.query(
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS friends_count INT DEFAULT 0",
    (err) => {
      if (err) {
        const schema = (db.config && db.config.database) || "mydatabase";
        const checkColumnQ = `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'friends_count'`;
        db.query(checkColumnQ, [schema], (chkErr, rows) => {
          if (chkErr) {
            console.error("Failed to check for friends_count column:", chkErr.message);
            return;
          }
          if (rows && rows[0] && rows[0].cnt === 0) {
            db.query("ALTER TABLE users ADD COLUMN friends_count INT DEFAULT 0", (addErr) => {
              if (addErr) console.error("Failed to add friends_count column to users:", addErr.message);
            });
          }
        });
      }
    }
  );

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
  const { postId, userId, content, imageurl, parentCommentId, replychain } = req.body;

  if (parentCommentId) {
    const getParent = "SELECT user_id, reply_chain_count FROM comments WHERE id = ?";
    db.query(getParent, [parentCommentId], (err, rows) => {
      if (err) {
        console.error("Failed to fetch parent comment:", err.message);
        return res.status(500).json({ error: "Unable to add reply to the database." });
      }

      const parent = rows && rows[0] ? rows[0] : null;
      const replyUserId = parent ? parent.user_id : null;
      const parentChain = parent ? (parent.reply_chain_count || 0) : 0;
      const newChain = (replychain !== undefined && replychain !== null) ? replychain : parentChain + 1;

      const q = "INSERT INTO comments (post_id, user_id, content, image_url, parent_comment_id, reply_chain_count, reply_user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        q,
        [postId, userId, content, imageurl, parentCommentId, newChain, replyUserId],
        (insErr, data) => {
          if (insErr) {
            console.error("Failed to add reply:", insErr.message);
            return res.status(500).json({ error: "Unable to add reply to the database." });
          }

          const newCommentId = data.insertId;
          const updateParent = "UPDATE comments SET reply_total = reply_total + 1 WHERE id = ?";
          db.query(updateParent, [parentCommentId], (err2) => {
            if (err2) console.error("Failed to update parent comment reply_total:", err2.message);
            return res.json({ message: "Reply added successfully!", commentId: newCommentId });
          });
        }
      );
    });
  } else {
    const q = "INSERT INTO comments (post_id, user_id, content, image_url, parent_comment_id, reply_chain_count) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      q,
      [postId, userId, content, imageurl, null, replychain || 0],
      (err, data) => {
        if (err) {
          console.error("Failed to add comment:", err.message);
          return res.status(500).json({ error: "Unable to add comment to the database." });
        }

        const newCommentId = data.insertId;
        const updatePost = "UPDATE posts SET replies_num = replies_num + 1 WHERE id = ?";
        db.query(updatePost, [postId], (err2) => {
          if (err2) console.error("Failed to update post replies_num:", err2.message);
          return res.json({ message: "Comment added successfully!", commentId: newCommentId });
        });
      }
    );
  }
});

app.post("/fetchUser", (req, res) => {
  const { userId } = req.body;

  const q = "SELECT username, display_name, bio, profile_picture_url, created_at, private, friends_count FROM users WHERE id = ?";

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

app.post("/fetchfriends", (req, res) => {
  const { userId } = req.body

  const q = "SELECT * FROM friends WHERE user_id = ? AND status = 'accepted'";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to check friends:", err.message);
      return res.status(500).json({ error: "Unable to search friends" });
    }
    return res.json(data);
  });
});

app.post("/fetchfriendrequests", (req, res) => {
  const { userId } = req.body

  const q = "SELECT * FROM friends WHERE friend_id = ? AND status = 'pending'";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to check friend requests:", err.message);
      return res.status(500).json({ error: "Unable to search friend requests" });
    }
    return res.json(data);
  });
});

app.post("/fetchsentrequests", (req, res) => {
  const { userId } = req.body

  const q = "SELECT * FROM friends WHERE user_id = ? AND status = 'pending'";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to check friend requests:", err.message);
      return res.status(500).json({ error: "Unable to search friend requests" });
    }
    return res.json(data);
  });
});

app.post("/fetchfriendstatus", (req, res) => {
  const { userId, friendId } = req.body;

  if (!userId || !friendId) {
    return res.json({ status: "none" });
  }

  const q = "SELECT * FROM friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)";
  
  db.query(q, [userId, friendId, friendId, userId], (err, data) => {
    if (err) {
      console.error("Failed to check friendship status:", err.message);
      return res.status(500).json({ error: "Unable to check friendship status" });
    }

    if (data.length === 0) {
      return res.json({ status: "none" });
    }

    const row = data[0];

    if (row.status === 'pending') {
      const isSender = Number(row.user_id) === Number(userId);
      return res.json({ 
        status: "pending", 
        isSender: isSender 
      });
    }

    return res.json({ status: "accepted" });
  });
});

app.post("/sendfriendrequest", (req, res) => {
  const { userId, friendId } = req.body

  const q = "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')";

  db.query(q, [userId, friendId], (err, data) => {
    if (err) {
      console.error("Failed to send friend request:", err.message);
      return res.status(500).json({ error: "Unable to send friend request" });
    }
    return res.json({ message: "Friend request sent successfully!" });
  });
});

app.post("/acceptfriendrequest", (req, res) => {
  const { userId, friendId } = req.body; 
  const updateOriginal = "UPDATE friends SET status = 'accepted' WHERE user_id = ? AND friend_id = ?";
  const insertMirror = "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')";

  db.query(updateOriginal, [friendId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to accept request" });

    db.query(insertMirror, [userId, friendId], (err2, result2) => {
      if (err2) return res.status(500).json({ error: "Failed to create mirror friendship" });
      
      // increment friends_count for both users
      const incQuery = "UPDATE users SET friends_count = friends_count + 1 WHERE id IN (?, ?)";
      db.query(incQuery, [userId, friendId], (incErr) => {
        if (incErr) console.error("Failed to increment friends_count:", incErr.message);
        return res.json({ message: "Friend request accepted!" });
      });
    });
  });
});

app.post("/declinefriendrequest", (req, res) => {
  const { userId, friendId } = req.body; 
  const deleteRequest = "DELETE FROM friends WHERE user_id = ? AND friend_id = ?";

  db.query(deleteRequest, [friendId, userId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to decline request" });
    
    return res.json({ message: "Friend request declined!" });
  });
});

app.post('/cancelfriendrequest', (req, res) => {
  const { userId, friendId } = req.body;
  const deleteRequest = 'DELETE FROM friends WHERE user_id = ? AND friend_id = ?';

  db.query(deleteRequest, [userId, friendId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to cancel request' });
    return res.json({ message: 'Friend request canceled!' });
  });
});

app.post("/unfriend", (req, res) => {
  const { userId, friendId } = req.body; 
  const deleteOriginal = "DELETE FROM friends WHERE user_id = ? AND friend_id = ?";
  const deleteMirror = "DELETE FROM friends WHERE user_id = ? AND friend_id = ?";

  db.query(deleteOriginal, [userId, friendId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to unfriend" });

    db.query(deleteMirror, [friendId, userId], (err2, result2) => {
      if (err2) return res.status(500).json({ error: "Failed to remove mirror friendship" });
      // decrement friends_count for both users (never go below 0)
      const decQuery = "UPDATE users SET friends_count = GREATEST(friends_count - 1, 0) WHERE id IN (?, ?)";
      db.query(decQuery, [userId, friendId], (decErr) => {
        if (decErr) console.error("Failed to decrement friends_count:", decErr.message);
        return res.json({ message: "Unfriended successfully!" });
      });
    });
  });
});

app.post("/fetchlikes", (req, res) => {
  const { userId } = req.body

  const q = "SELECT * FROM likes WHERE user_id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to check likes:", err.message);
      return res.status(500).json({ error: "Unable to search likes" });
    }
    return res.json(data);
  });
});

app.post("/fetchfollowed", (req, res) => {
  const { userId } = req.body

  const q = "SELECT * FROM followed_forums WHERE user_id = ?";

  db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Failed to check follows:", err.message);
      return res.status(500).json({ error: "Unable to search follows" });
    }
    return res.json(data);
  });
});

app.post("/fetchisfollowing", (req, res) => {
  const { userId, forumId } = req.body

  const q = "SELECT * FROM followed_forums WHERE user_id = ? AND forum_id = ?";

  db.query(q, [userId, forumId], (err, data) => {
    if (err) {
      console.error("Failed to check following status:", err.message);
      return res.status(500).json({ error: "Unable to check following status" });
    }
    return res.json({ isFollowing: data.length > 0 });
  });
});

app.post("/fetchUserActivity", (req, res) => {
    const { userId } = req.body;

    const q = `
        SELECT 
            'post' AS item_type,
            id AS item_id,
            title,
            content,
            image_url,
            created_at,
            likes_count,
            forum_id,
            NULL AS post_id,
            NULL AS parent_comment_id
        FROM posts
        WHERE user_id = ?

        UNION ALL

        SELECT 
            'comment' AS item_type,
            id AS item_id,
            NULL AS title,
            content,
            image_url,
            created_at,
            likes_count,
            NULL AS forum_id,
            post_id,
            parent_comment_id
        FROM comments
        WHERE user_id = ?

        ORDER BY created_at DESC;
    `;
    db.query(q, [userId, userId], (err, data) => {
        if (err) {
            console.error("Failed to fetch user activity:", err.message);
            return res.status(500).json({ error: "Unable to fetch user activity from the database." });
        }
        return res.json(data); 
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

app.post("/fetchcommentdata", (req, res) => {
  const { commentId } = req.body;

  const q = "SELECT * FROM comments WHERE id = ?";

  db.query(q, [commentId], (err, data) => {
    if (err) {
      console.error("Failed to fetch comment:", err.message);
      return res.status(500).json({ error: "Unable to fetch comment from the database." });
    }
    return res.json(data[0]);
  });
});

app.post('/fetchforumtags', (req, res) => {
  const { forumId } = req.body;
  const query = `
    SELECT t.name 
    FROM tags t
    INNER JOIN forum_tags ft ON t.id = ft.tag_id
    WHERE ft.forum_id = ?
  `;
  db.query(query, [forumId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const tagNames = results.map(row => row.name);
    
    res.json(tagNames);
  });
});

app.put('/comments/:id', async (req, res) => {
  const commentId = req.params.id;
  const { content, image_url } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Content cannot be empty.' });
  }

  try {
    const sql = `
      UPDATE comments 
      SET content = ?, image_url = ? 
      WHERE id = ?
    `;
    
    const result = await db.execute(sql, [content, image_url, commentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    res.status(200).json({ 
      message: 'Comment updated successfully.',
      updatedComment: { id: commentId, content, image_url }
    });
  } catch (error) {
    console.error('Database error details:', error);
    res.status(500).json({ error: 'Internal server error while editing comment.' });
  }
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

  if (!userId || (!commentId && !postId)) {
    return res.status(400).json({ error: "userId and either commentId or postId are required." });
  }

  const checkLikeQuery = "SELECT * FROM likes WHERE user_id = ? AND (comment_id = ? OR post_id = ?)";
  const insertLikeQuery = "INSERT INTO likes (user_id, comment_id, post_id) VALUES (?, ?, ?)";
  const deleteLikeQuery = "DELETE FROM likes WHERE user_id = ? AND (comment_id = ? OR post_id = ?)";

  db.query(checkLikeQuery, [userId, commentId || null, postId || null], (err, data) => {
    if (err) {
      console.error("Failed to check like status:", err.message);
      return res.status(500).json({ error: "Unable to check like status in the database." });
    }

    const isComment = !!commentId;
    const targetId = commentId || postId;

    if (data.length > 0) {
      // remove like: delete the exact like row
      const deleteQuery = isComment ? "DELETE FROM likes WHERE user_id = ? AND comment_id = ?" : "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
      db.query(deleteQuery, [userId, targetId], (err) => {
        if (err) {
          console.error("Failed to remove like:", err.message);
          return res.status(500).json({ error: "Unable to remove like from the database." });
        }

        const updateQuery = isComment ? "UPDATE comments SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?" : "UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?";
        db.query(updateQuery, [targetId], (err) => {
          if (err) console.error("Failed to decrement likes_count:", err.message);

          const getCountQuery = isComment ? "SELECT likes_count AS likes FROM comments WHERE id = ?" : "SELECT likes_count AS likes FROM posts WHERE id = ?";
          db.query(getCountQuery, [targetId], (err, rows) => {
            if (err) {
              console.error("Failed to fetch likes count:", err.message);
              return res.status(500).json({ error: "Unable to fetch likes count." });
            }
            return res.json({ isLiked: false, likes: rows[0]?.likes || 0 });
          });
        });
      });
    } else {
      // add like
      db.query(insertLikeQuery, [userId, commentId || null, postId || null], (err) => {
        if (err) {
          console.error("Failed to add like:", err.message);
          return res.status(500).json({ error: "Unable to add like to the database." });
        }

        const updateQuery = isComment ? "UPDATE comments SET likes_count = likes_count + 1 WHERE id = ?" : "UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?";
        db.query(updateQuery, [targetId], (err) => {
          if (err) console.error("Failed to increment likes_count:", err.message);

          const getCountQuery = isComment ? "SELECT likes_count AS likes FROM comments WHERE id = ?" : "SELECT likes_count AS likes FROM posts WHERE id = ?";
          db.query(getCountQuery, [targetId], (err, rows) => {
            if (err) {
              console.error("Failed to fetch likes count:", err.message);
              return res.status(500).json({ error: "Unable to fetch likes count." });
            }
            return res.json({ isLiked: true, likes: rows[0]?.likes || 0 });
          });
        });
      });
    }
  });
});

app.post("/toggleFollow", (req, res) => {
  const { userId, forumId } = req.body;

  if (!userId || !forumId) {
    return res.status(400).json({ error: "userId and forumId are required." });
  }

  const checkQuery = "SELECT * FROM followed_forums WHERE user_id = ? AND forum_id = ?";
  const insertQuery = "INSERT INTO followed_forums (user_id, forum_id) VALUES (?, ?)";
  const deleteQuery = "DELETE FROM followed_forums WHERE user_id = ? AND forum_id = ?";

  db.query(checkQuery, [userId, forumId], (err, data) => {
    if (err) {
      console.error("Failed to check follow status:", err.message);
      return res.status(500).json({ error: "Unable to check follow status in the database." });
    }

    if (data.length > 0) {
      // unfollow
      db.query(deleteQuery, [userId, forumId], (delErr) => {
        if (delErr) {
          console.error("Failed to remove follow:", delErr.message);
          return res.status(500).json({ error: "Unable to remove follow from the database." });
        }

        const decQuery = "UPDATE forums SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = ?";
        db.query(decQuery, [forumId], (updErr) => {
          if (updErr) console.error("Failed to decrement followers_count:", updErr.message);

          const getQuery = "SELECT followers_count AS followers FROM forums WHERE id = ?";
          db.query(getQuery, [forumId], (gErr, rows) => {
            if (gErr) {
              console.error("Failed to fetch followers count:", gErr.message);
              return res.status(500).json({ error: "Unable to fetch followers count." });
            }
            return res.json({ isFollowing: false, followers: rows[0]?.followers || 0 });
          });
        });
      });
    } else {
      // follow
      db.query(insertQuery, [userId, forumId], (insErr) => {
        if (insErr) {
          console.error("Failed to add follow:", insErr.message);
          return res.status(500).json({ error: "Unable to add follow to the database." });
        }

        const incQuery = "UPDATE forums SET followers_count = followers_count + 1 WHERE id = ?";
        db.query(incQuery, [forumId], (updErr) => {
          if (updErr) console.error("Failed to increment followers_count:", updErr.message);

          const getQuery = "SELECT followers_count AS followers FROM forums WHERE id = ?";
          db.query(getQuery, [forumId], (gErr, rows) => {
            if (gErr) {
              console.error("Failed to fetch followers count:", gErr.message);
              return res.status(500).json({ error: "Unable to fetch followers count." });
            }
            return res.json({ isFollowing: true, followers: rows[0]?.followers || 0 });
          });
        });
      });
    }
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000!");
});

