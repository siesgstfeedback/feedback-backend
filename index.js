const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');


dotenv.config();

const app = express();

// CORS setup: Only allow requests from your frontend URL
const allowedOrigin = 'https://siesgstfeedback.netlify.app/';  // Replace with your frontend URL

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin === allowedOrigin) {
      callback(null, true);  // Allow request
    } else {
      callback(new Error('Not allowed by CORS'));  // Reject request
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Supabase client
const supabase = createClient(
  "https://fbzliymspsswhlgtsrso.supabase.co",
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiemxpeW1zcHNzd2hsZ3RzcnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1ODUyODgsImV4cCI6MjA0MDE2MTI4OH0.NpxhvPukcLmcLoQFWVwLqpy3I5iM6LT73_AeB_I7bsI'
);

// SUPABASE_URL=https://fbzliymspsswhlgtsrso.supabase.co
// SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiemxpeW1zcHNzd2hsZ3RzcnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ1ODUyODgsImV4cCI6MjA0MDE2MTI4OH0.NpxhvPukcLmcLoQFWVwLqpy3I5iM6LT73_AeB_I7bsI

// Example endpoint: Check student login
app.post('/check-admin', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      const { data, error } = await supabase
        .from('admin')
        .select()
        .eq('a_email', email);
  
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Database error' });
      }
  
      if (data.length > 0) {
        return res.status(200).json({ isAdmin: true });
      } else {
        return res.status(200).json({ isAdmin: false });
      }
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
});

// Simple route to check server status
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Faculty data route
app.get('/faculty-data', async (req, res) => {
  try {
    const { data, error } = await supabase.from('faculty').select();
    
    if (error) {
      console.error('Error fetching faculty data:', error);
      return res.status(500).json({ error: 'Error fetching faculty data' });
    }

    res.status(200).json({ data: data || [] });
  } catch (err) {
    console.error('Error in faculty-data endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to add a faculty member
app.post('/add-faculty', async (req, res) => {
  const { f_empid, f_name, f_email } = req.body;

  if (!f_empid || !f_name || !f_email) {
    return res.status(400).json({ error: 'Employee ID, Name, and Email are required' });
  }

  try {
    const { error } = await supabase.from('faculty').insert([
      { f_empid, f_name, f_email }
    ]);

    if (error) {
      console.error('Error adding faculty:', error.message);
      return res.status(500).json({ error: 'Error adding faculty member' });
    }

    res.status(201).json({ message: 'Faculty member added successfully' });
  } catch (err) {
    console.error('Error in add-faculty endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to delete a faculty member
app.delete('/delete-faculty/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('faculty')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting faculty:', error.message);
      return res.status(500).json({ error: 'Error deleting faculty member' });
    }

    res.status(200).json({ message: 'Faculty member deleted successfully' });
  } catch (err) {
    console.error('Error in delete-faculty endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET /subjects?page=1&batchSize=50
app.get('/subjects', async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let batchSize = parseInt(req.query.batchSize) || 50;

  const from = (page - 1) * batchSize;
  const to = from + batchSize - 1;

  try {
    const { data, error } = await supabase
      .from("subject")
      .select("*")
      .range(from, to);

    if (error) {
      console.error("Error fetching subjects:", error);
      return res.status(500).json({ error: "Failed to fetch subjects" });
    }

    return res.json({ data });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


// Express endpoint in your backend
// app.get('/subjects', async (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const batchSize = parseInt(req.query.batchSize) || 1000;
  
//     const from = (page - 1) * batchSize;
//     const to = from + batchSize - 1;
  
//     try {
//       const { data, error } = await supabase
//         .from("subject")
//         .select("*")
//         .range(from, to);
  
//       if (error) {
//         console.error("Error fetching subjects:", error);
//         return res.status(500).json({ error: "Error fetching subject data" });
//       }
  
//       return res.json({ data });
//     } catch (err) {
//       console.error("Server error:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//   });

  app.post('/add-subject', async (req, res) => {
    const newSubject = req.body;
  
    const { subject_name, subject_type, subject_branch, subject_semester } = newSubject;
  
    if (!subject_name || !subject_type || !subject_branch || !subject_semester) {
      return res.status(400).json({ error: 'All subject fields are required' });
    }
  
    try {
      const { error } = await supabase.from('subject').insert([newSubject]);
  
      if (error) {
        console.error("Error adding subject:", error.message);
        return res.status(500).json({ error: 'Error adding subject' });
      }
  
      return res.status(201).json({ message: 'Subject added successfully' });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.delete('/delete-subject/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const { error } = await supabase.from('subject').delete().eq('id', id);
  
      if (error) {
        console.error("Error deleting subject:", error.message);
        return res.status(500).json({ error: 'Error deleting subject' });
      }
  
      return res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  app.get('/faculty-list', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('f_empid, f_name');
  
      if (error) {
        console.error('Error fetching faculties:', error.message);
        return res.status(500).json({ error: 'Failed to fetch faculties' });
      }
  
      return res.status(200).json({ data: data || [] });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/faculty-subjects/:f_empid', async (req, res) => {
    const { f_empid } = req.params;
  
    try {
      const { data, error } = await supabase
        .from("f_allocation")
        .select()
        .eq("f_empid", f_empid);
  
      if (error) {
        console.error("Error fetching allocated subjects:", error);
        return res.status(500).json({ error: "Failed to fetch faculty subjects" });
      }
  
      return res.status(200).json({ data: data || [] });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST /api/assign-subject
app.post('/api/assign-subject', async (req, res) => {
    const { faculty, subject, type, branch, semester, division, batch } = req.body;
  
    // Validate input data
    if (!faculty || !subject || !type || !branch || !semester || !division) {
      return res.status(400).json({ error: "All fields are required." });
    }
  
    try {
      // Insert a row for each selected batch if applicable
      if (batch && batch.length > 0) {
        for (const b of batch) {
          const { error } = await supabase.from("f_allocation").insert({
            f_empid: faculty,
            subject_name: subject,
            subject_type: type,
            subject_branch: branch,
            subject_semester: semester,
            division: division,
            batch: b,
          });
  
          if (error) {
            console.error("Error assigning subject:", error);
            return res.status(500).json({ error: "Failed to assign subject to batch" });
          }
        }
      } else {
        // Insert a single row if no batches are selected
        const { error } = await supabase.from("f_allocation").insert({
          f_empid: faculty,
          subject_name: subject,
          subject_type: type,
          subject_branch: branch,
          subject_semester: semester,
          division: division,
          batch: null,
        });
  
        if (error) {
          console.error("Error assigning subject:", error);
          return res.status(500).json({ error: "Failed to assign subject" });
        }
      }
  
      res.status(201).json({ message: "Subject assigned successfully" });
    } catch (err) {
      console.error("Error in assign-subject endpoint:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  // DELETE /api/delete-subject/:subjectId
app.delete('/api/delete-subject/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
  
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }
  
    try {
      const { error } = await supabase
        .from('f_allocation')
        .delete()
        .eq('id', subjectId);
  
      if (error) {
        console.error('Error deleting subject:', error.message);
        return res.status(500).json({ error: 'Error deleting subject' });
      }
  
      res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  

  // GET /api/subjects?branch={branch}&semester={semester}&type={type}
app.get('/api/subjects', async (req, res) => {
    const { branch, semester, type } = req.query;
  
    if (!branch || !semester || !type) {
      return res.status(400).json({ error: 'Branch, Semester, and Type are required' });
    }
  
    try {
      const { data, error } = await supabase
        .from("subject")
        .select()
        .eq("subject_branch", branch)
        .eq("subject_semester", semester)
        .eq("subject_type", type);
  
      if (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ error: "Failed to fetch subjects" });
      }
  
      res.status(200).json(data || []);
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // POST /api/login
app.post('/api/flogin', async (req, res) => {
    const { username, password, designation } = req.body;
  
    if (!username || !password || !designation) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      let data, error;
  
      if (designation === 'admin') {
        // Check admin credentials
        ({ data, error } = await supabase
          .from('admin')
          .select('*')
          .eq('a_email', username)
          .eq('a_password', password));
  
        if (error) {
          console.error('Error checking admin credentials:', error);
          return res.status(500).json({ error: 'Error verifying admin credentials' });
        }
  
        if (data.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
  
      } else if (designation === 'faculty') {
        // Check faculty credentials
        ({ data, error } = await supabase
          .from('faculty')
          .select('*')
          .eq('f_email', username)
          .eq('f_empid', password));
  
        if (error) {
          console.error('Error checking faculty credentials:', error);
          return res.status(500).json({ error: 'Error verifying faculty credentials' });
        }
  
        if (data.length === 0) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
  
      } else if (designation === 'ttcord') {
        // Check ttcord credentials (hardcoded validation)
        const ttcordEmails = [
          'ttcordfe@sies.edu.in', 'ttcordce@sies.edu.in', 'ttcordit@sies.edu.in',
          'ttcordextc@sies.edu.in', 'ttcordecs@sies.edu.in', 'ttcordaids@sies.edu.in',
          'ttcordaiml@sies.edu.in', 'ttcordiot@sies.edu.in', 'ttcordmech@sies.edu.in'
        ];
  
        const ttcordPasswords = [
          'TTCOORDFE', 'TTCOORDCE', 'TTCOORDIT', 'TTCOORDEXTC', 'TTCOORDECS',
          'TTCOORDAIDS', 'TTCOORDAIML', 'TTCOORDIOT', 'TTCOORDMECH'
        ];
  
        if (ttcordEmails.includes(username) && ttcordPasswords[ttcordEmails.indexOf(username)] === password) {
          data = { username, designation };
        } else {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
  
      } else {
        return res.status(400).json({ error: 'Invalid designation. Please select either admin, faculty, or ttcord.' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Login successful', user: data });
  
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

  // GET /api/settings/feedback-display
app.get('/api/settings/feedback-display', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("settings11")
        .select("display_facultyfeedback")
        .single();
  
      if (error) {
        console.error("Error fetching settings:", error);
        return res.status(500).json({ error: "Failed to fetch settings" });
      }
  
      res.status(200).json({ display_facultyfeedback: data.display_facultyfeedback });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /api/faculty/:email
app.get('/api/faculty/:email', async (req, res) => {
    const { email } = req.params;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      const { data, error } = await supabase
        .from("faculty")
        .select("f_empid, f_name")
        .eq("f_email", email);
  
      if (error) {
        console.error("Error fetching faculty:", error);
        return res.status(500).json({ error: "Error fetching faculty data" });
      }
  
      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Faculty not found" });
      }
  
      res.status(200).json({ f_empid: data[0].f_empid, f_name: data[0].f_name });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

  // GET /api/faculty/:empid/subjects
app.get('/api/faculty/:empid/subjects', async (req, res) => {
    const { empid } = req.params;
  
    if (!empid) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }
  
    try {
      const { data, error } = await supabase
        .from("f_allocation")
        .select()
        .eq("f_empid", empid);
  
      if (error) {
        console.error("Error fetching assigned subjects:", error);
        return res.status(500).json({ error: "Error fetching assigned subjects" });
      }
  
      res.status(200).json(data || []);
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  

//   // GET /api/subjects
// app.get('/api/subjects', async (req, res) => {
//     const { branch, semester, type } = req.query;
  
//     if (!branch || !semester || !type) {
//       return res.status(400).json({ error: "branch, semester, and type are required" });
//     }
  
//     try {
//       const { data, error } = await supabase
//         .from("subject")
//         .select()
//         .eq("subject_branch", branch)
//         .eq("subject_semester", semester)
//         .eq("subject_type", type);
  
//       if (error) {
//         console.error("Error fetching subjects:", error);
//         return res.status(500).json({ error: "Failed to fetch subjects" });
//       }
  
//       res.status(200).json(data || []);
//     } catch (err) {
//       console.error("Server error:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   });


// Backend: POST /assign-subject (Server-side)
app.post('/assign-fsubject', async (req, res) => {
    const { f_empid, selectedSubject, selectedType, selectedBranch, selectedSemester, selectedDivision, selectedBatch } = req.body;
  
    try {
      // Validate required fields
      if (!f_empid || !selectedSubject || !selectedDivision || !selectedBranch || !selectedSemester) {
        return res.status(400).json({ success: false, message: 'Please fill all the required fields.' });
      }
  
      // Handle Lab subjects and batch validation
      if (
        (selectedType === "Lab" || selectedType === "DLO 1 Lab" || selectedType === "DLO 2 Lab") &&
        selectedBatch.length === 0
      ) {
        return res.status(400).json({ success: false, message: 'Please select at least one batch.' });
      }
  
      // Insert each selected batch into the database
      if (selectedBatch.length > 0) {
        for (const batch of selectedBatch) {
          const { error } = await supabase.from("f_allocation").insert({
            f_empid: f_empid,
            subject_name: selectedSubject,
            subject_type: selectedType,
            subject_branch: selectedBranch,
            subject_semester: selectedSemester,
            division: selectedDivision,
            batch: batch,
          });
  
          if (error) {
            console.error("Error assigning subject:", error);
            return res.status(500).json({ success: false, message: 'Failed to assign subject' });
          }
        }
      } else {
        // Insert a single row if no batches are selected
        const { error } = await supabase.from("f_allocation").insert({
          f_empid: f_empid,
          subject_name: selectedSubject,
          subject_type: selectedType,
          subject_branch: selectedBranch,
          subject_semester: selectedSemester,
          division: selectedDivision,
          batch: null,
        });
  
        if (error) {
          console.error("Error assigning subject:", error);
          return res.status(500).json({ success: false, message: 'Failed to assign subject' });
        }
      }
  
      // Return success response
      res.status(200).json({ success: true, message: 'Subject assigned successfully!' });
    } catch (error) {
      console.error('Error during subject assignment:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  
  

  // Backend: DELETE /delete-subject/:subjectId (Server-side)
app.delete('/delete-fsubject/:subjectId', async (req, res) => {
    const { subjectId } = req.params;
  
    try {
      // Delete the subject from f_allocation based on subjectId
      const { error } = await supabase
        .from("f_allocation")
        .delete()
        .eq("id", subjectId);
  
      if (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({ success: false, message: 'Failed to delete subject' });
      }
  
      // Return success response
      res.status(200).json({ success: true, message: 'Subject deleted successfully!' });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  

//=================== Admin Panel ===========

// student feedback / profile settings
// GET /get-settings
app.get('/get-settings', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('settings11')
        .select('*')
        .eq('id', 1)
        .single();
  
      if (error) {
        console.error('Error fetching settings:', error.message);
        return res.status(500).json({ error: 'Failed to fetch settings' });
      }
  
      return res.status(200).json({
        student_editing: data.student_editing,
        student_feedback: data.student_feedback,
        display_facultyfeedback: data.display_facultyfeedback,
        feedback_header_text: data.feedback_header_text,
      });
    } catch (err) {
      console.error('Unexpected error in /get-settings:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  // PATCH /update-setting
  app.patch('/update-setting', async (req, res) => {
    const { setting, value } = req.body;
  
    // Basic validation
    if (typeof setting !== 'string' || typeof value !== 'boolean') {
      return res.status(400).json({ error: 'Invalid payload' });
    }
  
    try {
      const { error } = await supabase
        .from('settings11')
        .update({ [setting]: value })
        .eq('id', 1);
  
      if (error) {
        console.error(`Supabase error updating ${setting}:`, error);
        return res.status(500).json({ error: `Failed to update ${setting}` });
      }
  
      return res
        .status(200)
        .json({ message: `${setting} updated`, setting, value });
    } catch (err) {
      console.error('Server error in /update-setting:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  // PATCH /update-feedback-header
  app.patch('/update-feedback-header', async (req, res) => {
    const { feedback_header_text } = req.body;
  
    if (typeof feedback_header_text !== 'string') {
      return res.status(400).json({ error: 'Invalid header text' });
    }
  
    try {
      const { error } = await supabase
        .from('settings11')
        .update({ feedback_header_text })
        .eq('id', 1);
  
      if (error) {
        console.error('Supabase error updating header:', error);
        return res.status(500).json({ error: 'Failed to update header' });
      }
  
      return res
        .status(200)
        .json({ message: 'Header updated', feedback_header_text });
    } catch (err) {
      console.error('Server error in /update-feedback-header:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // DELETE /delete-table
  app.post('/delete-table', async (req, res) => {
    const { tableName } = req.body;
  
    if (typeof tableName !== 'string' || tableName.trim() === '') {
      return res.status(400).json({ error: 'Invalid tableName' });
    }
  
    try {
      // Perform the delete operation (all rows with id ≠ 0)
      const { error } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '0');
  
      if (error) {
        console.error(`Supabase error deleting from ${tableName}:`, error);
        return res.status(500).json({ success: false, error: 'Deletion failed' });
      }
  
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(`Server error in /delete-table:`, err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });
  
  
  // In your Express backend (e.g., routes/faculty.js)
app.get('/api/fetchfaculties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("faculty")
      .select("f_empid, f_name");

    if (error) {
      console.error("Error fetching faculty names:", error);
      return res.status(500).json({ error: "Failed to fetch faculty names" });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/form-student/:prn', async (req, res) => {
  const { prn } = req.params;

  try {
    const { data, error } = await supabase
      .from("student")
      .select("*")
      .eq("s_prn", prn)
      .single();

    if (error || !data) {
      console.error("Error fetching student:", error);
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/submit-feedback', async (req, res) => {
  const feedbackData = req.body;

  const requiredFields = [
    "q1", "q2", "q3", "q4", "q5", "q6", "q7",
    "s_prn", "f_empid1", "f_subject", "f_year", "f_branch"
  ];

  const missingFields = requiredFields.filter((field) => !feedbackData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Please provide feedback for all questions." });
  }

  try {
    const { error } = await supabase.from("feedback").insert([feedbackData]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Error submitting feedback." });
    }

    res.status(200).json({ message: "Feedback submitted successfully!" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/filled-feedbacks/:prn', async (req, res) => {
  const { prn } = req.params;

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .eq("s_prn", prn);

    if (error) {
      console.error("Error fetching filled feedbacks:", error);
      return res.status(500).json({ error: "Error fetching filled feedbacks." });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/api/sp-settings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("settings11")
      .select("student_editing, student_feedback")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Supabase error fetching settings:", error);
      return res.status(500).json({ error: "Failed to fetch settings" });
    }

    res.json({
      student_editing: data.student_editing,
      student_feedback: data.student_feedback,
    });
  } catch (err) {
    console.error("Server error in GET /api/settings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/fv-check-faculty", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const { data, error } = await supabase
      .from("faculty")
      .select("f_empid")
      .eq("f_email", email)
      .single(); // expect at most one row

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    if (!data) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Success: return the empid
    return res.json({ f_empid: data.f_empid });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error" });
  }
});


// routes/facultyAllocation.js (example)

app.get('/api/tt-faculty-allocation', async (req, res) => {
  const { branch, semester, division } = req.query;

  if (!branch || !semester || !division) {
    return res.status(400).json({ error: 'Branch, Semester, and Division are required' });
  }

  try {
    const { data: allocationData, error: allocationError } = await supabase
      .from("f_allocation")
      .select("subject_name, f_empid, batch")
      .eq("subject_branch", branch)
      .eq("subject_semester", semester)
      .eq("division", division);

    if (allocationError) {
      console.error("Error fetching allocation:", allocationError);
      return res.status(500).json({ error: "Error fetching allocation data" });
    }

    const enrichedAllocations = await Promise.all(
      allocationData.map(async (allocation) => {
        const { data: facultyData, error: facultyError } = await supabase
          .from("faculty")
          .select("f_name")
          .eq("f_empid", allocation.f_empid)
          .single();

        return {
          ...allocation,
          facultyName: facultyError ? "Unknown" : facultyData.f_name,
        };
      })
    );

    res.status(200).json(enrichedAllocations);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/feedback-summary", async (req, res) => {
  const { empid, subject } = req.body;
  if (!empid || !subject) {
    return res
      .status(400)
      .json({ error: "Both empid and subject are required" });
  }

  try {
    const step = 1000;
    let from = 0;
    let allFeedback = [];

    // 1️⃣ Fetch in batches of 1000
    while (true) {
      const { data, error } = await supabase
        .from("feedback")
        .select("q1, q2, q3, q4, q5")
        .eq("f_empid1", empid)
        .eq("f_subject", subject)
        .range(from, from + step - 1);

      if (error) throw error;
      if (!data.length) break;

      allFeedback.push(...data);
      from += step;
    }

    if (!allFeedback.length) {
      // no feedback: return zeros
      return res.json({
        counts: [0, 0, 0, 0, 0],
        percentages: [0, 0, 0, 0, 0],
        average: 0,
      });
    }

    // 2️⃣ Aggregate counts & compute weighted sum
    const counts = [0, 0, 0, 0, 0];
    let weightedSum = 0;
    const totalRatings = allFeedback.length * 5;

    allFeedback.forEach((fb) => {
      for (let i = 1; i <= 5; i++) {
        const val = fb[`q${i}`];
        if (val >= 1 && val <= 5) {
          counts[val - 1]++;
          weightedSum += val;
        }
      }
    });

    // 3️⃣ Compute percentages & average
    const percentages = counts.map(
      (c) => ((c / totalRatings) * 100).toFixed(2)
    );
    const average = (weightedSum / totalRatings).toFixed(2);

    return res.json({ counts, percentages, average });
  } catch (err) {
    console.error("Error in /api/feedback-summary:", err);
    return res
      .status(500)
      .json({ error: "Unexpected error fetching feedback summary" });
  }
});


app.get("/api/fv-faculty/:empid/subjects/unique", async (req, res) => {
  const { empid } = req.params;
  if (!empid) {
    return res.status(400).json({ error: "Faculty ID is required" });
  }

  try {
    const step = 1000;
    let from = 0;
    let allRecords = [];

    // 1️⃣ page through f_allocation
    while (true) {
      const { data, error } = await supabase
        .from("f_allocation")
        .select(
          "id, f_empid, subject_name, subject_type, subject_branch, subject_semester, division, batch"
        )
        .eq("f_empid", empid)
        .range(from, from + step - 1);

      if (error) throw error;
      if (!data.length) break;

      allRecords.push(...data);
      from += step;
    }

    // 2️⃣ de‑duplicate by subject_name
    const seen = new Set();
    const unique = [];
    for (const r of allRecords) {
      if (!seen.has(r.subject_name)) {
        seen.add(r.subject_name);
        unique.push(r);
      }
    }

    res.json(unique);
  } catch (err) {
    console.error("Error in /api/faculty/:empid/subjects/unique:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// routes/feedback.js or directly in app.js
app.get("/api/fetchfeedback", async (req, res) => {
  const { branch, year } = req.query;

  if (!branch || !year) {
    return res.status(400).json({ error: "Branch and Year are required" });
  }

  try {
    const { data, error } = await supabase
      .from("feedback")
      .select("f_empid1, f_subject, q1, q2, q3, q4, q5, q6, q7")
      .eq("f_branch", branch)
      .eq("f_year", year);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }

    const uniqueFeedbackMap = new Map();

    data.forEach((row) => {
      const key = `${row.f_empid1}-${row.f_subject}`;
      if (!uniqueFeedbackMap.has(key)) {
        uniqueFeedbackMap.set(key, { ...row, count: 1 });
      } else {
        const existingRow = uniqueFeedbackMap.get(key);
        for (let i = 1; i <= 7; i++) {
          existingRow[`q${i}`] += row[`q${i}`];
        }
        existingRow.count += 1;
        uniqueFeedbackMap.set(key, existingRow);
      }
    });

    const averagedFeedback = Array.from(uniqueFeedbackMap.values()).map((row) => {
      const result = {};
      for (let i = 1; i <= 7; i++) {
        result[`q${i}`] = (row[`q${i}`] / row.count).toFixed(3);
      }
      return {
        f_empid1: row.f_empid1,
        f_subject: row.f_subject,
        ...result,
      };
    });

    res.status(200).json(averagedFeedback);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/api/form-faculty-names', async (req, res) => {
  const { empIds } = req.body;

  if (!Array.isArray(empIds) || empIds.length === 0) {
    return res.status(400).json({ error: "empIds must be a non-empty array" });
  }

  try {
    const { data, error } = await supabase
      .from("faculty")
      .select("f_empid, f_name")
      .in("f_empid", empIds);

    if (error) {
      console.error("Error fetching faculty names:", error);
      return res.status(500).json({ error: "Failed to fetch faculty names" });
    }

    res.status(200).json(data || []);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post("/api/form-fetch-allocations", async (req, res) => {
  const { studentData } = req.body;
  if (!studentData) {
    return res.status(400).json({ error: "studentData is required" });
  }

  try {
    let combinedData = [];

    // 1. Theory
    const { data: theoryData, error: theoryError } = await supabase
      .from("f_allocation")
      .select("*")
      .eq("subject_type", "Theory")
      .eq("subject_branch", studentData.s_branch)
      .eq("subject_semester", studentData.s_semester)
      .eq("division", studentData.s_division);
    if (theoryError) console.error(theoryError);
    else combinedData.push(...theoryData);

    // 2. Lab
    const { data: labData, error: labError } = await supabase
      .from("f_allocation")
      .select("*")
      .eq("subject_type", "Lab")
      .eq("subject_branch", studentData.s_branch)
      .eq("subject_semester", studentData.s_semester)
      .eq("division", studentData.s_division)
      .or(`batch.eq.${studentData.s_batch},batch.is.null`);
    if (labError) console.error(labError);
    else combinedData.push(...labData);

    // 3. ILO
    if (studentData.s_ilo) {
      const { data: iloData, error: iloError } = await supabase
        .from("f_allocation")
        .select("*")
        .eq("subject_name", studentData.s_ilo)
        .eq("subject_branch", studentData.s_branch)
        .eq("subject_semester", studentData.s_semester)
        .eq("division", studentData.s_division);
      if (iloError) console.error(iloError);
      else combinedData.push(...iloData);
    }

    // 4. DLO1 theory
    if (studentData.s_dlo1) {
      const { data: dlo1Data, error: dlo1Error } = await supabase
        .from("f_allocation")
        .select("*")
        .eq("subject_name", studentData.s_dlo1)
        .eq("subject_branch", studentData.s_branch)
        .eq("subject_semester", studentData.s_semester)
        .eq("division", studentData.s_division);
      if (dlo1Error) console.error(dlo1Error);
      else combinedData.push(...dlo1Data);
    }

    // 5. DLO1 lab
    if (studentData.s_dlo1_lab) {
      const { data: dlo1LabData, error: dlo1LabError } = await supabase
        .from("f_allocation")
        .select("*")
        .eq("subject_name", studentData.s_dlo1_lab)
        .eq("subject_branch", studentData.s_branch)
        .eq("subject_semester", studentData.s_semester)
        .eq("division", studentData.s_division)
        .or(`batch.eq.${studentData.s_batch},batch.is.null`);
      if (dlo1LabError) console.error(dlo1LabError);
      else combinedData.push(...dlo1LabData);
    }

    // 6. DLO2 theory
    if (studentData.s_dlo2) {
      const { data: dlo2Data, error: dlo2Error } = await supabase
        .from("f_allocation")
        .select("*")
        .eq("subject_name", studentData.s_dlo2)
        .eq("subject_branch", studentData.s_branch)
        .eq("subject_semester", studentData.s_semester)
        .eq("division", studentData.s_division);
      if (dlo2Error) console.error(dlo2Error);
      else combinedData.push(...dlo2Data);
    }

    // 7. DLO2 lab
    if (studentData.s_dlo2_lab) {
      const { data: dlo2LabData, error: dlo2LabError } = await supabase
        .from("f_allocation")
        .select("*")
        .eq("subject_name", studentData.s_dlo2_lab)
        .eq("subject_branch", studentData.s_branch)
        .eq("subject_semester", studentData.s_semester)
        .eq("division", studentData.s_division)
        .or(`batch.eq.${studentData.s_batch},batch.is.null`);
      if (dlo2LabError) console.error(dlo2LabError);
      else combinedData.push(...dlo2LabData);
    }

    // sort by created_at
    combinedData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return res.json(combinedData);
  } catch (err) {
    console.error("fetch-allocations error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('settings11')
      .select('student_feedback, display_facultyfeedback')
      .eq('id', 1)
      .single();

    if (error) throw error;

    res.json({
      student_feedback: data.student_feedback,
      display_facultyfeedback: data.display_facultyfeedback,
    });
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.get("/api/settings/header-text", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("settings11")
      .select("feedback_header_text")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error fetching header text:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch header text" });
    }

    res.json({
      feedback_header_text: data.feedback_header_text,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/api/not-filled-students", async (req, res) => {
  const { branch, year } = req.query;
  if (!branch || !year) {
    return res
      .status(400)
      .json({ error: "Please provide both branch and year" });
  }

  try {
    const limit = 1000;
    let offset = 0;
    let studentPRNs = [];

    // 1️⃣ Fetch all student PRNs in batches
    while (true) {
      const { data: students, error: studentError } = await supabase
        .from("student")
        .select("s_prn")
        .eq("s_branch", branch)
        .eq("s_year", year)
        .range(offset, offset + limit - 1);

      if (studentError) throw studentError;
      if (!students.length) break;

      studentPRNs.push(...students.map((s) => s.s_prn));
      offset += limit;
    }

    // 2️⃣ Fetch all feedback PRNs in batches
    offset = 0;
    let feedbackPRNs = [];

    while (true) {
      const { data: feedback, error: feedbackError } = await supabase
        .from("feedback")
        .select("s_prn")
        .eq("f_branch", branch)
        .eq("f_year", year)
        .range(offset, offset + limit - 1);

      if (feedbackError) throw feedbackError;
      if (!feedback.length) break;

      feedbackPRNs.push(...feedback.map((f) => f.s_prn));
      offset += limit;
    }

    // 3️⃣ Compute difference
    const notFilledPRNs = studentPRNs.filter(
      (prn) => !feedbackPRNs.includes(prn)
    );

    return res.json(notFilledPRNs);
  } catch (err) {
    console.error("Error in /api/not-filled-students:", err);
    return res
      .status(500)
      .json({ error: "Unexpected error fetching students" });
  }
});

app.post("/api/student-login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // email format check (same regex as frontend)
  const emailPattern = /^[^\s@]+@gst\.sies\.edu\.in$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Invalid college email address" });
  }

  try {
    const { data, error } = await supabase
      .from("student")
      .select("s_email,s_prn")
      .eq("s_email", email)
      .eq("s_prn", password);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }
    if (!data || data.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // success: return student record
    return res.json({ student: data[0] });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/student-record", async (req, res) => {
  const { email, prn } = req.body;
  if (!email || !prn) {
    return res
      .status(400)
      .json({ error: "Both email and PRN are required" });
  }

  try {
    // Use .single() since we expect exactly one row
    const { data, error } = await supabase
      .from("student")
      .select(
        "s_name, s_prn, s_year, s_semester, s_branch, s_division, s_batch, s_email"
      )
      .eq("s_email", email)
      .eq("s_prn", prn)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "No student record found." });
    }

    // Map to your desired shape
    const student = {
      name: data.s_name,
      prn: data.s_prn,
      year: data.s_year,
      semester: data.s_semester,
      branch: data.s_branch,
      division: data.s_division,
      batch: data.s_batch,
      email: data.s_email,
    };

    return res.json({ student });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: "Unexpected error while fetching record." });
  }
});


app.patch("/api/student-record", async (req, res) => {
  const {
    name,
    prn,
    year,
    semester,
    branch,
    division,
    batch,
    email,
  } = req.body;

  // Basic validation
  if (!email || !prn) {
    return res
      .status(400)
      .json({ error: "Both email and PRN are required to identify the record." });
  }

  try {
    const { error } = await supabase
      .from("student")
      .update({
        s_name: name,
        s_prn: prn,
        s_year: year,
        s_semester: semester,
        s_branch: branch,
        s_division: division,
        s_batch: batch,
        s_email: email,
      })
      .eq("s_email", email)
      .eq("s_prn", prn);

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "Failed to update record." });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Server error in PATCH /api/student-record:", err);
    return res
      .status(500)
      .json({ error: "Unexpected server error while updating record." });
  }
});



app.post('/api/backup', async (req, res) => {
  const { tableName } = req.body; // Extract table name from the request body

  if (!tableName) {
    return res.status(400).json({ error: 'Table name is required' });
  }

  try {
    const allData = [];
    const pageSize = 1000;
    let from = 0;
    let to = pageSize - 1;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .range(from, to);

      if (error) {
        console.error(`Error fetching data from ${tableName}:`, error);
        return res.status(500).json({ error: `Error fetching data from ${tableName}` });
      }

      if (data.length > 0) {
        allData.push(...data);
        from += pageSize;
        to += pageSize;
      } else {
        hasMore = false;
      }
    }

    if (allData.length === 0) {
      return res.status(404).json({ error: `No data found in table ${tableName}.` });
    }

    // Convert data to CSV
    const csvContent =
      Object.keys(allData[0]).join(',') + '\n' + // Headers
      allData.map((row) => Object.values(row).join(',')).join('\n'); // Data rows

    // Send the CSV content as a downloadable file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${tableName}_backup.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Unexpected error in backup:', err);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
