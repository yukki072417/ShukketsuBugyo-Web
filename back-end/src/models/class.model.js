const db = require('../models/db')();
const { errorHandle } = require('../services/errorHandle');

async function createClasses(tenantID, bodys) {
    if (!Array.isArray(bodys)) errorHandle("BAD_REQUEST", 400);
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 既存クラス取得
        const [exist] = await connection.query('SELECT * FROM CLASSES WHERE TENANT_ID = ?', [tenantID]);

        // リクエスト内で重複チェック（grade/class/teacher_idの組み合わせのみ）
        const seen = new Set();
        for (const body of bodys) {
            const key = `${body.grade}_${body.class}_${body.teacher_id}`;
            if (seen.has(key)) {
                await connection.rollback();
                errorHandle('REQUEST_DUPLICATE', 409);
            }
            seen.add(key);
        }

        for (const body of bodys) {
            const { grade, class: className, teacher_id } = body;

            // DB内で重複チェック（grade/classの組み合わせのみ）
            const duplicates = exist.filter(item =>
                item.GRADE === grade &&
                item.CLASS === className
            );

            if (duplicates.length > 0) {
                await connection.rollback();
                errorHandle('DUPLICATE', 409);
            }

            const query = 'INSERT INTO CLASSES(TENANT_ID, TEACHER_ID, GRADE, CLASS) VALUES(?, ?, ?, ?)';
            const values = [tenantID, teacher_id, grade, className];
            const [result] = await connection.query(query, values);

            if (result.affectedRows === 0) {
                await connection.rollback();
                errorHandle('SERVER_ERROR', 400);
            }
        }
        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getClasses(tenantID) {
    const connection = await db.getConnection();
    try {
        const query = 'SELECT * FROM CLASSES WHERE TENANT_ID = ?';
        const values = [tenantID];

        const result = await connection.query(query, values);
        // データがない場合は空配列を返す
        return { success: true, data: result[0] }
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function patchClasses(tenantID, bodys) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
        for(const body of bodys){
            const { grade, class: className, updated_grade, updated_class, teacher_id } = body;
            
            // 必須パラメータのチェック
            if(!grade || !className || !updated_grade || !updated_class || !teacher_id) {
                errorHandle('BAD_REQUEST', 400);
            }

            // 元のクラスの存在チェック
            const [exist] = await connection.query(
                'SELECT * FROM CLASSES WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?',
                [tenantID, grade, className]
            );
            if(exist.length === 0) {
                errorHandle('NOT_FOUND', 404);
            }
            
            // 更新後のgrade/classの組み合わせが既に存在しないかチェック
            // （元のクラスと同じ場合は除外）
            if (grade !== updated_grade || className !== updated_class) {
                const [duplicateCheck] = await connection.query(
                    'SELECT * FROM CLASSES WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?',
                    [tenantID, updated_grade, updated_class]
                );
                if(duplicateCheck.length > 0) {
                    errorHandle('DUPLICATE', 409);
                }
            }
            
            // 更新処理（元のgrade/classで特定し、新しい値で更新）
            const query = 'UPDATE CLASSES SET GRADE = ?, CLASS = ?, TEACHER_ID = ? WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?';
            const values = [updated_grade, updated_class, teacher_id, tenantID, grade, className];
            const [result] = await connection.query(query, values);

            if(result.affectedRows === 0) {
                errorHandle('SERVER_ERROR', 500);
            }
        }
        await connection.commit();
        return { success: true }
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteClass(tenantID, grade, className) {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const exist = await connection.query('SELECT * FROM CLASSES WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?', [tenantID, grade, className]);
        if(exist[0].length === 0) errorHandle('NOT_FOUND', 404);

        // 該当クラスの生徒のGRADE, CLASSをNULLに更新
        await connection.query(
            'UPDATE STUDENTS SET GRADE = NULL, CLASS = NULL WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?',
            [tenantID, grade, className]
        );

        const query = 'DELETE FROM CLASSES WHERE TENANT_ID = ? AND GRADE = ? AND CLASS = ?';
        const values = [tenantID, grade, className];
        const result = await connection.query(query, values);

        if(result[0].affectedRows === 0) errorHandle('NOT_FOUND', 404);

        await connection.commit();
        return { success: true }
    }catch(error){
        await connection.rollback();
        throw error;
    }finally{
        connection.release();
    }
}

async function getUnassignedStudents(tenantID) {
    const connection = await db.getConnection();
    try {
        const query = 'SELECT * FROM STUDENTS WHERE TENANT_ID = ? AND (GRADE IS NULL OR CLASS IS NULL)';
        const values = [tenantID];

        const result = await connection.query(query, values);
        return { success: true, data: result[0] }
    } catch (error) {
        connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { 
    createClasses,
    getClasses,
    patchClasses,
    deleteClass,
    getUnassignedStudents
}