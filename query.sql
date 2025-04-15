;WITH CTE AS (
    SELECT 
        ID,
        MachineCode,
        MachineName,
        -- Menentukan OPERATION_NAME secara bergantian
        CASE 
            WHEN (ROW_NUMBER() OVER (ORDER BY ID) - 1) % 2 = 0 THEN 'NORMAL OPERATION'
            ELSE 'CHOKOTEI'
        END AS NewOperationName,
        DATEADD(MINUTE, (ROW_NUMBER() OVER (ORDER BY ID) - 1) * 15, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('08:00:00' AS DATETIME)) AS NewCreatedAt
    FROM 
        [MACHINE_LOG].[dbo].[Machine_45044]
    WHERE 
        MachineCode = '45044'
)
UPDATE [MACHINE_LOG].[dbo].[Machine_45044]
SET 
    CreatedAt = CTE.NewCreatedAt,
    OPERATION_NAME = CTE.NewOperationName
FROM CTE
WHERE [MACHINE_LOG].[dbo].[Machine_45044].ID = CTE.ID;