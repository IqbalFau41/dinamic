const sql = require("mssql");

// Get all history items
const getJobHistory = async () => {
  try {
    const result = await sql.query`
      SELECT * FROM history_joblist 
      ORDER BY deleted_at DESC
    `;
    return result.recordset;
  } catch (error) {
    console.error("Error fetching job history:", error.message);
    throw error;
  }
};

// Move job to history
const moveToHistory = async (no_part) => {
  try {
    const jobData = await sql.query`
      SELECT * FROM member_joblist WHERE no_part = ${no_part}
    `;

    if (jobData.recordset.length === 0) {
      throw new Error("Job not found");
    }

    const job = jobData.recordset[0];

    await sql.query`
      INSERT INTO history_joblist (
        nqp, nama_job, job_class, sub_section, 
        factory, job_des, update_job, due_date, 
        tanggal_selesai, no_part
      ) VALUES (
        ${job.nqp}, ${job.nama_job}, ${job.job_class}, 
        ${job.sub_section}, ${job.factory}, ${job.job_des}, 
        ${job.update_job}, ${job.due_date}, 
        ${job.tanggal_selesai}, ${job.no_part}
      )
    `;

    await sql.query`
      DELETE FROM member_joblist WHERE no_part = ${no_part}
    `;

    return { message: "Job moved to history successfully" };
  } catch (error) {
    console.error("Error moving job to history:", error.message);
    throw error;
  }
};

module.exports = {
  getJobHistory,
  moveToHistory,
};
