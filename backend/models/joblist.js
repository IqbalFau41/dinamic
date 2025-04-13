// models/joblist.js

// Create new job list item
const createJobListItem = async (data, deptMfgPool) => {
  const { NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = data;

  try {
    // Check if connection exists
    if (!deptMfgPool) {
      throw new Error("Database connection not available");
    }

    const request = deptMfgPool.request();

    // Add parameters
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
      )`);

    return { message: "Job list item created successfully" };
  } catch (error) {
    console.error("Error creating job list item:", error.message);
    throw error;
  }
};

// Get all job list items
const getJobListItems = async (deptMfgPool) => {
  try {
    if (!deptMfgPool) {
      throw new Error("Database connection not available");
    }

    const request = deptMfgPool.request();

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

    return result.recordset;
  } catch (error) {
    console.error("Error fetching job list items:", error.message);
    throw error;
  }
};

// Get job list item by NRP
const getJobListItemByNRP = async (NRP, deptMfgPool) => {
  try {
    if (!deptMfgPool) {
      throw new Error("Database connection not available");
    }

    const request = deptMfgPool.request();
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
      throw new Error("Job list item not found");
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching job list item:", error.message);
    throw error;
  }
};

// Update job list item
const updateJobListItem = async (NRP, data, deptMfgPool) => {
  const { NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = data;

  // Validation
  if (!NRP || !NAME) {
    throw new Error("NRP and Name are required.");
  }

  try {
    if (!deptMfgPool) {
      throw new Error("Database connection not available");
    }

    // Check if item exists
    const checkRequest = deptMfgPool.request();
    checkRequest.input("nrp", NRP);

    const checkResult = await checkRequest.query(`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    if (checkResult.recordset.length === 0) {
      throw new Error("Job list item not found");
    }

    // Update the item
    const updateRequest = deptMfgPool.request();
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
      WHERE NRP = @nrp`);

    return { message: "Job list item updated successfully" };
  } catch (error) {
    console.error("Error updating job list item:", error.message);
    throw error;
  }
};

// Delete job list item
const deleteJobListItem = async (NRP, deptMfgPool) => {
  try {
    if (!deptMfgPool) {
      throw new Error("Database connection not available");
    }

    // Check if item exists
    const checkRequest = deptMfgPool.request();
    checkRequest.input("nrp", NRP);

    const checkResult = await checkRequest.query(`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    if (checkResult.recordset.length === 0) {
      throw new Error("Job list item not found");
    }

    // Delete the item
    const deleteRequest = deptMfgPool.request();
    deleteRequest.input("nrp", NRP);

    await deleteRequest.query(`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = @nrp
    `);

    return { message: "Job list item deleted successfully" };
  } catch (error) {
    console.error("Error deleting job list item:", error.message);
    throw error;
  }
};

module.exports = {
  createJobListItem,
  getJobListItems,
  getJobListItemByNRP,
  updateJobListItem,
  deleteJobListItem,
};
