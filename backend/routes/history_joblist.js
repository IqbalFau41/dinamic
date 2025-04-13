const express = require("express");
const router = express.Router();

// Endpoint to move job to history
router.post("/move-to-history/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // 1. Check if job exists
    const checkRequest = deptMfg.request();
    checkRequest.input("nrp", NRP);

    const checkJob = await checkRequest.query(`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    if (checkJob.recordset.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = checkJob.recordset[0];

    try {
      const insertRequest = deptMfg.request();
      insertRequest.input("nrp", job.NRP);
      insertRequest.input("name", job.NAME);
      insertRequest.input("job_class", job.JOB_CLASS || null);
      insertRequest.input("job_desc", job.JOB_DESC || null);
      insertRequest.input("factory", job.FACTORY || null);
      insertRequest.input("due_date", job.DUE_DATE || null);
      insertRequest.input("created_at", job.created_at || null);

      // 2. Insert into history table
      await insertRequest.query(`
        INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] (
          NRP, 
          NAME, 
          JOB_CLASS, 
          JOB_DESC, 
          FACTORY, 
          DUE_DATE, 
          STATUS,
          COMPLETION_DATE,
          ORIGINAL_CREATED_AT
        ) VALUES (
          @nrp, 
          @name, 
          @job_class, 
          @job_desc, 
          @factory, 
          @due_date, 
          'COMPLETED',
          GETDATE(),
          @created_at
        )
      `);

      // 3. Delete from job list
      const deleteRequest = deptMfg.request();
      deleteRequest.input("nrp", NRP);

      await deleteRequest.query(`
        DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
      `);

      res.status(200).json({
        message: "Job successfully moved to history",
        job: job,
      });
    } catch (error) {
      console.error("Database operation error:", error);

      // Check if table doesn't exist
      if (error.message.includes("Invalid object name")) {
        try {
          // Create history table if it doesn't exist
          await deptMfg.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USER_JOBLIST_HISTORY]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[USER_JOBLIST_HISTORY] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [NRP] VARCHAR(50) NOT NULL,
                    [NAME] VARCHAR(255) NOT NULL,
                    [JOB_CLASS] VARCHAR(100) NULL,
                    [JOB_DESC] VARCHAR(MAX) NULL,
                    [FACTORY] VARCHAR(100) NULL,
                    [DUE_DATE] DATETIME NULL,
                    [STATUS] VARCHAR(50) NULL,
                    [COMPLETION_DATE] DATETIME NOT NULL,
                    [ORIGINAL_CREATED_AT] DATETIME NULL
                )
            END
          `);

          // Retry insert and delete after creating table
          const retryInsertRequest = deptMfg.request();
          retryInsertRequest.input("nrp", job.NRP);
          retryInsertRequest.input("name", job.NAME);
          retryInsertRequest.input("job_class", job.JOB_CLASS || null);
          retryInsertRequest.input("job_desc", job.JOB_DESC || null);
          retryInsertRequest.input("factory", job.FACTORY || null);
          retryInsertRequest.input("due_date", job.DUE_DATE || null);
          retryInsertRequest.input("created_at", job.created_at || null);

          await retryInsertRequest.query(`
            INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] (
              NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, 
              DUE_DATE, STATUS, COMPLETION_DATE, ORIGINAL_CREATED_AT
            ) VALUES (
              @nrp, @name, @job_class, @job_desc, @factory, 
              @due_date, 'COMPLETED', GETDATE(), @created_at
            )
          `);

          const deleteRequest = deptMfg.request();
          deleteRequest.input("nrp", NRP);
          await deleteRequest.query(`
            DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
          `);

          return res.status(200).json({
            message:
              "Job successfully moved to history (table was created automatically)",
            job: job,
          });
        } catch (createTableError) {
          console.error("Error creating history table:", createTableError);
          return res.status(500).json({
            message: "Failed to create history table",
            error: createTableError.message,
          });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Error moving job to history:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET all job history items
router.get("/", async (req, res) => {
  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const result = await deptMfg.request().query(`
      SELECT 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        COMPLETION_DATE,
        ORIGINAL_CREATED_AT
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY]
      ORDER BY COMPLETION_DATE DESC
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching job history:", error.message);

    // If table doesn't exist, return empty array
    if (error.message.includes("Invalid object name")) {
      return res.status(200).json([]);
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE job history item
router.delete("/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const deleteRequest = deptMfg.request();
    deleteRequest.input("nrp", NRP);

    const result = await deleteRequest.query(`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] 
      WHERE NRP = @nrp
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Job history not found" });
    }

    res.status(200).json({
      message: "Job history successfully deleted",
      deletedNRP: NRP,
    });
  } catch (error) {
    console.error("Error deleting job history:", error.message);
    res.status(500).json({
      message: "Failed to delete job history",
      error: error.message,
    });
  }
});

module.exports = router;
