// routes/joblist.js
const express = require("express");
const router = express.Router();

// GET all job list items
router.get("/", async (req, res) => {
  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      console.error("Database connection not available for DEPT_MANUFACTURING");
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    const result = await request.query(`
      SELECT TOP (1000) 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        created_at,
        updated_at
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST]
      ORDER BY created_at DESC
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching job list items:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET single job list item by NRP
router.get("/:NRP", async (req, res) => {
  const { NRP } = req.params;
  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    request.input("nrp", NRP);

    const result = await request.query(`
      SELECT 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        created_at,
        updated_at
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      WHERE NRP = @nrp
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Job list item not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching job list item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Create new job list item
router.post("/", async (req, res) => {
  const { NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } =
    req.body;

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    request.input("nrp", NRP);
    request.input("name", NAME);
    request.input("job_class", JOB_CLASS || null);
    request.input("job_desc", JOB_DESC || null);
    request.input("factory", FACTORY || null);

    // Fix date handling
    if (DUE_DATE) {
      try {
        // If DUE_DATE is already a Date object
        if (DUE_DATE instanceof Date) {
          request.input("due_date", DUE_DATE);
        } else {
          // Try to parse the date string
          const parsedDate = new Date(DUE_DATE);

          // Check if the date is valid
          if (!isNaN(parsedDate.getTime())) {
            request.input("due_date", parsedDate);
          } else {
            request.input("due_date", null);
          }
        }
      } catch (e) {
        console.error("Date parsing error:", e);
        request.input("due_date", null);
      }
    } else {
      request.input("due_date", null);
    }

    request.input("status", STATUS || null);

    await request.query(`
      INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] (
        NRP, 
        NAME, 
        JOB_CLASS, 
        JOB_DESC, 
        FACTORY, 
        DUE_DATE, 
        STATUS,
        created_at,
        updated_at
      ) VALUES (
        @nrp, 
        @name, 
        @job_class, 
        @job_desc, 
        @factory, 
        @due_date, 
        @status,
        GETDATE(),
        GETDATE()
      )
    `);

    res.status(201).json({ message: "Job list item created successfully" });
  } catch (error) {
    console.error("Error creating job list item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update job list item
router.put("/:NRP", async (req, res) => {
  const { NRP } = req.params;
  const { NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = req.body;

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("nrp", NRP);

    const checkItem = await checkRequest.query(`
      SELECT NRP FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update item
    const updateRequest = deptMfg.request();
    updateRequest.input("nrp", NRP);
    updateRequest.input("name", NAME);
    updateRequest.input("job_class", JOB_CLASS || null);
    updateRequest.input("job_desc", JOB_DESC || null);
    updateRequest.input("factory", FACTORY || null);

    // Fix date handling
    if (DUE_DATE) {
      try {
        // If DUE_DATE is already a Date object
        if (DUE_DATE instanceof Date) {
          updateRequest.input("due_date", DUE_DATE);
        } else {
          // Try to parse the date string
          const parsedDate = new Date(DUE_DATE);

          // Check if the date is valid
          if (!isNaN(parsedDate.getTime())) {
            updateRequest.input("due_date", parsedDate);
          } else {
            updateRequest.input("due_date", null);
          }
        }
      } catch (e) {
        console.error("Date parsing error:", e);
        updateRequest.input("due_date", null);
      }
    } else {
      updateRequest.input("due_date", null);
    }

    updateRequest.input("status", STATUS || null);

    await updateRequest.query(`
      UPDATE [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      SET 
        NAME = @name, 
        JOB_CLASS = @job_class, 
        JOB_DESC = @job_desc, 
        FACTORY = @factory, 
        DUE_DATE = @due_date, 
        STATUS = @status,
        updated_at = GETDATE()
      WHERE NRP = @nrp
    `);

    res.status(200).json({ message: "Job list item updated successfully" });
  } catch (error) {
    console.error("Error updating job list item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE job list item
router.delete("/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("nrp", NRP);

    const checkItem = await checkRequest.query(`
      SELECT NRP FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Delete the item
    const deleteRequest = deptMfg.request();
    deleteRequest.input("nrp", NRP);

    await deleteRequest.query(`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    res.status(200).json({ message: "Job list item deleted successfully" });
  } catch (error) {
    console.error("Error deleting job list item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
