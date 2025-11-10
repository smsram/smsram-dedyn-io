const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { createClient } = require("@libsql/client");
require("dotenv").config();

// Create transporter using Gmail account
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // smsram001@gmail.com (for authentication)
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

// DB client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Helper to generate 8-char ID
function generateId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// POST /mail/subscribe
// Newsletter subscription
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // Check if email already exists
    const existingUser = await db.execute({
      sql: "SELECT id, status FROM subscribers WHERE email = ?",
      args: [email],
    });

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      
      // If unsubscribed, reactivate
      if (user.status === 'unsubscribed') {
        await db.execute({
          sql: "UPDATE subscribers SET status = 'active', subscribed_at = ? WHERE email = ?",
          args: [new Date().toISOString(), email],
        });

        return res.json({
          success: true,
          message: "Welcome back! Subscription reactivated.",
        });
      }

      return res.status(400).json({
        success: false,
        error: "Email already subscribed",
      });
    }

    // Generate new subscriber ID
    const id = generateId();
    const now = new Date().toISOString();

    // Insert into database
    await db.execute({
      sql: `INSERT INTO subscribers (id, email, subscribed_at, status) VALUES (?, ?, ?, ?)`,
      args: [id, email, now, 'active'],
    });

    // Send welcome email
    const fromEmail = process.env.EMAIL_FROM_ADDRESS || "meher@smsram.dedyn.io";
    const fromName = process.env.EMAIL_FROM_NAME || "SMSRam";

    const welcomeEmail = {
      from: {
        name: fromName,
        address: fromEmail,
      },
      to: email,
      subject: "🎉 Welcome to SMSRam Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
              line-height: 1.6; 
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .header {
              background: linear-gradient(135deg, #00d4ff 0%, #9370db 100%);
              padding: 50px 30px;
              text-align: center;
            }
            .logo {
              width: 100px;
              height: auto;
              margin-bottom: 15px;
            }
            .header h1 { 
              color: white; 
              font-size: 32px;
              font-weight: 700;
              margin: 0;
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 24px;
              color: #00d4ff;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .cta-button {
              display: inline-block;
              padding: 15px 40px;
              background: linear-gradient(135deg, #00d4ff 0%, #9370db 100%);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 30px; 
              background: #1e293b;
              color: #94a3b8;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <img 
                src="https://drive.google.com/uc?export=view&id=10LSvL9-RtF3rOxDvUZx_u5XWAjLg4fV8" 
                alt="SMSRam Logo" 
                class="logo"
              />
              <h1>Welcome to SMSRam!</h1>
            </div>
            
            <div class="content">
              <p class="greeting">Hey there! 👋</p>
              <p>Thank you for subscribing to SMSRam newsletter! You're now part of an awesome community of developers and learners.</p>
              
              <p><strong>What to expect:</strong></p>
              <ul>
                <li>🎥 New video tutorials and courses</li>
                <li>💻 Latest source code releases</li>
                <li>🚀 Project updates and showcases</li>
                <li>💡 Tips, tricks, and best practices</li>
              </ul>

              <div style="text-align: center;">
                <a href="https://smsram.com" class="cta-button">Explore Dashboard</a>
              </div>
            </div>

            <div class="footer">
              <p><strong>SMSRam</strong> - Building Digital Solutions</p>
              <p>© ${new Date().getFullYear()} SMSRam. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(welcomeEmail);

    res.json({
      success: true,
      message: "Successfully subscribed! Check your email for confirmation.",
    });
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({
      success: false,
      error: "Failed to subscribe",
      details: error.message,
    });
  }
});

// POST /mail/contact
router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address",
      });
    }

    // Use alias email for "from" address
    const fromEmail = process.env.EMAIL_FROM_ADDRESS || "meher@smsram.dedyn.io";
    const fromName = process.env.EMAIL_FROM_NAME || "SMSRam";

    // Send confirmation email to user
    // User confirmation email with logo
    const userMailOptions = {
      from: {
        name: fromName,
        address: fromEmail,
      },
      to: email,
      subject: "✅ Thank you for contacting SMSRam",
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 20px;
        }
        .email-wrapper {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #00d4ff 0%, #9370db 100%);
          padding: 50px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: drift 20s linear infinite;
        }
        @keyframes drift {
          from { transform: translate(0, 0); }
          to { transform: translate(50px, 50px); }
        }
        .logo-container {
          position: relative;
          margin-bottom: 20px;
          display: inline-block;
        }
        .logo {
          width: 120px;
          height: auto;
          display: block;
          margin: 0 auto;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          position: relative;
          z-index: 1;
        }
        .header h1 { 
          color: white; 
          margin: 0; 
          font-size: 32px;
          font-weight: 700;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
          position: relative;
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px;
        }
        .greeting {
          font-size: 24px;
          color: #00d4ff;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-card {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 25px;
          border-radius: 15px;
          margin: 25px 0;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        .message-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 5px;
          height: 100%;
          background: linear-gradient(180deg, #00d4ff, #9370db);
        }
        .message-card p {
          margin: 10px 0;
          color: #2d3748;
        }
        .message-card strong {
          color: #00d4ff;
          font-weight: 600;
        }
        .user-message {
          background: white;
          padding: 20px;
          border-radius: 10px;
          margin-top: 15px;
          border: 2px dashed #00d4ff;
          color: #4a5568;
          font-style: italic;
        }
        .info-text {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          border-left: 4px solid #0ea5e9;
          color: #0c4a6e;
        }
        .cta-button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #00d4ff 0%, #9370db 100%);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          margin: 20px 0;
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
        }
        .social-links {
          text-align: center;
          padding: 20px;
          background: #f8fafc;
        }
        .social-links a {
          display: inline-block;
          width: 40px;
          height: 40px;
          margin: 0 8px;
          background: #00d4ff;
          color: white;
          border-radius: 50%;
          text-decoration: none;
          line-height: 40px;
          font-weight: bold;
        }
        .footer { 
          text-align: center; 
          padding: 30px; 
          background: #1e293b;
          color: #94a3b8;
          font-size: 14px;
        }
        .footer p { margin: 5px 0; }
        .footer a {
          color: #00d4ff;
          text-decoration: none;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="header">
          <div class="logo-container">
            <img 
              src="https://drive.google.com/uc?export=view&id=10LSvL9-RtF3rOxDvUZx_u5XWAjLg4fV8" 
              alt="SMSRam Logo" 
              class="logo"
            />
          </div>
          <h1>Message Received!</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${name} 👋</p>
          <p>Thank you for reaching out to <strong>SMSRam</strong>! We've successfully received your message and our team is already on it.</p>
          
          <div class="message-card">
            <p><strong>📋 Subject:</strong> ${subject}</p>
            <div class="user-message">
              "${message}"
            </div>
          </div>

          <div class="info-text">
            <p><strong>⏱️ What's Next?</strong></p>
            <p>Our team typically responds within <strong>24 hours</strong> during business days. We'll reach out to you at <strong>${email}</strong> with a detailed response.</p>
          </div>

          <div class="divider"></div>

          <div style="text-align: center;">
            <p style="margin-bottom: 20px;">While you wait, explore our latest content:</p>
            <a href="https://smsram.com" class="cta-button">Visit SMSRam</a>
          </div>
        </div>

        <div class="social-links">
          <p style="margin-bottom: 15px; color: #64748b;">Connect with us</p>
          <a href="https://github.com/smsram" title="GitHub">G</a>
          <a href="https://youtube.com/smsram" title="YouTube">Y</a>
          <a href="https://instagram.com/smsram" title="Instagram">I</a>
        </div>

        <div class="footer">
          <p><strong>SMSRam</strong> - Building Digital Solutions</p>
          <p>© ${new Date().getFullYear()} SMSRam. All rights reserved.</p>
          <p style="margin-top: 15px; font-size: 12px;">
            If you didn't send this message, please ignore this email.<br>
            <a href="mailto:${fromEmail}">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
    };

    // Send notification email to admin
    const adminMailOptions = {
      from: {
        name: "SMSRam Contact Form",
        address: fromEmail,
      },
      to: process.env.EMAIL_USER,
      subject: `🔔 New Contact: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6; 
              color: #1e293b;
              background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .header { 
              background: linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%);
              padding: 40px 30px;
              text-align: center;
              color: white;
            }
            .header h1 { 
              font-size: 28px;
              font-weight: 700;
              margin: 10px 0 0 0;
            }
            .badge {
              display: inline-block;
              background: rgba(255, 255, 255, 0.2);
              padding: 8px 20px;
              border-radius: 50px;
              font-size: 14px;
              margin-top: 10px;
              backdrop-filter: blur(10px);
            }
              .logo {
          width: 100px;
          height: auto;
          display: block;
          margin: 0 auto 15px;
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
        }
            .content { 
              padding: 40px 30px;
              background: #ffffff;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 20px 0;
            }
            .info-card {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              padding: 20px;
              border-radius: 12px;
              border-left: 4px solid #ff6b35;
            }
            .info-card strong {
              color: #ff6b35;
              display: block;
              margin-bottom: 5px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .info-card p {
              color: #334155;
              font-size: 16px;
              margin: 0;
              word-break: break-word;
            }
            .message-section {
              background: white;
              border: 2px solid #fbbf24;
              padding: 25px;
              border-radius: 15px;
              margin: 25px 0;
              box-shadow: 0 4px 15px rgba(251, 191, 36, 0.2);
            }
            .message-section strong {
              color: #f59e0b;
              display: block;
              margin-bottom: 10px;
              font-size: 14px;
            }
            .message-content {
              color: #475569;
              line-height: 1.8;
              padding: 15px;
              background: #fef3c7;
              border-radius: 8px;
            }
            .action-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .reply-button {
              display: inline-block;
              padding: 15px 40px;
              background: linear-gradient(135deg, #ff6b35 0%, #f59e0b 100%);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
            }
            .metadata {
              background: #f8fafc;
              padding: 20px;
              border-radius: 10px;
              margin-top: 20px;
              font-size: 13px;
              color: #64748b;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background: #0f172a;
              color: #94a3b8;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
            <img 
            src="https://drive.google.com/uc?export=view&id=10LSvL9-RtF3rOxDvUZx_u5XWAjLg4fV8" 
            alt="SMSRam Logo" 
            class="logo"
          />
              <div style="font-size: 50px; margin-bottom: 10px;">📧</div>
              <h1>New Contact Form Submission</h1>
              <div class="badge">Requires Response</div>
            </div>
            
            <div class="content">
              <div class="info-grid">
                <div class="info-card">
                  <strong>👤 From</strong>
                  <p>${name}</p>
                </div>
                <div class="info-card">
                  <strong>📧 Email</strong>
                  <p><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
                </div>
                <div class="info-card">
                  <strong>📝 Subject</strong>
                  <p>${subject}</p>
                </div>
                <div class="info-card">
                  <strong>🕐 Received</strong>
                  <p>${new Date().toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}</p>
                </div>
              </div>

              <div class="message-section">
                <strong>💬 MESSAGE CONTENT</strong>
                <div class="message-content">
                  ${message}
                </div>
              </div>

              <div class="action-buttons">
                <a href="mailto:${email}" class="reply-button">Reply to ${name}</a>
              </div>

              <div class="metadata">
                <p><strong>📌 Quick Actions:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Click the button above to reply directly</li>
                  <li>This email is set to reply to: ${email}</li>
                  <li>Priority: Normal</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><strong>SMSRam Admin Panel</strong></p>
              <p>Automated notification from contact form</p>
              <p style="margin-top: 10px; font-size: 12px;">© ${new Date().getFullYear()} SMSRam</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: email,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions),
    ]);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send email",
      details: error.message,
    });
  }
});

module.exports = router;
