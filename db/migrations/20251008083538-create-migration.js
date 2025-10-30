'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. TENANTS
    await queryInterface.createTable('TENANTS', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        primaryKey: true,
        allowNull: false
      },
      TENANT_NAME: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      TENANT_NAME_EN: {
        type: Sequelize.STRING(255),
        allowNull: false
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 2. TEACHERS
    await queryInterface.createTable('TEACHERS', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      TEACHER_ID: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      PASSWORD: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      MANAGER: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 3. COURSES
    await queryInterface.createTable('COURSES', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      COURSE_ID: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },
      COURSE_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      COURSE_NAME_EN: {
        type: Sequelize.STRING(255),
        allowNull: true
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 4. CLASSES
    await queryInterface.createTable('CLASSES', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      GRADE: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        primaryKey: true
      },
      CLASS: {
        type: Sequelize.STRING(15),
        allowNull: false,
        primaryKey: true
      },
      TEACHER_ID: {
        type: Sequelize.STRING(20),
        allowNull: false
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 5. STUDENTS
    await queryInterface.createTable('STUDENTS', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      STUDENT_ID: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      GRADE: {
        type: Sequelize.CHAR(1),
        allowNull: true
      },
      CLASS: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      NUMBER: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true
      },
      PASSWORD: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      COURSE_ID: {
        type: Sequelize.CHAR(36),
        allowNull: true
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 6. LESSONS
    await queryInterface.createTable('LESSONS', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      LESSON_ID: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },
      TEACHER_ID: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      LESSON_NAME: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      LESSON_NAME_EN: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      GRADE: {
        type: Sequelize.CHAR(1),
        allowNull: false
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 7. ENROLLMENTS
    await queryInterface.createTable('ENROLLMENTS', {
      ENROLLMENT_ID: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      STUDENT_ID: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      LESSON_ID: {
        type: Sequelize.CHAR(36),
        allowNull: false
      },
      STATUS: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 8. TIME_SLOTS
    await queryInterface.createTable('TIME_SLOTS', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      PERIOD: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      START_TIME: {
        type: Sequelize.TIME,
        allowNull: false
      },
      END_TIME: {
        type: Sequelize.TIME,
        allowNull: false
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 9. TIME_TABLE
    await queryInterface.createTable('TIME_TABLE', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      LESSON_ID: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },
      PERIOD: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      DAY_OF_WEEK: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        primaryKey: true
      },
      GRADE: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        primaryKey: true
      },
      CLASS: {
        type: Sequelize.STRING(15),
        allowNull: false,
        primaryKey: true
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // 10. ATTENDANCE
    await queryInterface.createTable('ATTENDANCE', {
      TENANT_ID: {
        type: Sequelize.STRING(30),
        allowNull: false,
        primaryKey: true
      },
      ENROLLMENT_ID: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        primaryKey: true
      },
      STUDENT_ID: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      DATE: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        primaryKey: true
      },
      PERIOD: {
        type: Sequelize.STRING(20),
        allowNull: false,
        primaryKey: true
      },
      STATUS: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 0
      },
      NOTES: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    });

    // Add foreign key constraints
    await queryInterface.addConstraint('TEACHERS', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_teachers_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('COURSES', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_courses_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('CLASSES', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_classes_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('CLASSES', {
      fields: ['TENANT_ID', 'TEACHER_ID'],
      type: 'foreign key',
      name: 'fk_classes_teacher',
      references: {
        table: 'TEACHERS',
        fields: ['TENANT_ID', 'TEACHER_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('STUDENTS', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_students_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('STUDENTS', {
      fields: ['TENANT_ID', 'GRADE', 'CLASS'],
      type: 'foreign key',
      name: 'fk_students_class',
      references: {
        table: 'CLASSES',
        fields: ['TENANT_ID', 'GRADE', 'CLASS']
      },
      onDelete: 'SET NULL'
    });

    await queryInterface.addConstraint('LESSONS', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_lessons_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('LESSONS', {
      fields: ['TENANT_ID', 'TEACHER_ID'],
      type: 'foreign key',
      name: 'fk_lessons_teacher',
      references: {
        table: 'TEACHERS',
        fields: ['TENANT_ID', 'TEACHER_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ENROLLMENTS', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_enrollments_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ENROLLMENTS', {
      fields: ['TENANT_ID', 'STUDENT_ID'],
      type: 'foreign key',
      name: 'fk_enrollments_student',
      references: {
        table: 'STUDENTS',
        fields: ['TENANT_ID', 'STUDENT_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ENROLLMENTS', {
      fields: ['TENANT_ID', 'LESSON_ID'],
      type: 'foreign key',
      name: 'fk_enrollments_lesson',
      references: {
        table: 'LESSONS',
        fields: ['TENANT_ID', 'LESSON_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('TIME_SLOTS', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_timeslots_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('TIME_TABLE', {
      fields: ['TENANT_ID', 'LESSON_ID'],
      type: 'foreign key',
      name: 'fk_timetable_lesson',
      references: {
        table: 'LESSONS',
        fields: ['TENANT_ID', 'LESSON_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('TIME_TABLE', {
      fields: ['TENANT_ID', 'GRADE', 'CLASS'],
      type: 'foreign key',
      name: 'fk_timetable_class',
      references: {
        table: 'CLASSES',
        fields: ['TENANT_ID', 'GRADE', 'CLASS']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('TIME_TABLE', {
      fields: ['TENANT_ID', 'PERIOD'],
      type: 'foreign key',
      name: 'fk_timetable_timeslot',
      references: {
        table: 'TIME_SLOTS',
        fields: ['TENANT_ID', 'PERIOD']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ATTENDANCE', {
      fields: ['TENANT_ID'],
      type: 'foreign key',
      name: 'fk_attendance_tenant',
      references: {
        table: 'TENANTS',
        field: 'TENANT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ATTENDANCE', {
      fields: ['ENROLLMENT_ID'],
      type: 'foreign key',
      name: 'fk_attendance_enrollment',
      references: {
        table: 'ENROLLMENTS',
        field: 'ENROLLMENT_ID'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ATTENDANCE', {
      fields: ['TENANT_ID', 'STUDENT_ID'],
      type: 'foreign key',
      name: 'fk_attendance_student',
      references: {
        table: 'STUDENTS',
        fields: ['TENANT_ID', 'STUDENT_ID']
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('ATTENDANCE', {
      fields: ['TENANT_ID', 'PERIOD'],
      type: 'foreign key',
      name: 'fk_attendance_timeslot',
      references: {
        table: 'TIME_SLOTS',
        fields: ['TENANT_ID', 'PERIOD']
      },
      onDelete: 'CASCADE'
    });

    // Add unique constraints
    await queryInterface.addConstraint('ENROLLMENTS', {
      fields: ['TENANT_ID', 'STUDENT_ID', 'LESSON_ID'],
      type: 'unique',
      name: 'unique_student_lesson'
    });

    // Add indexes
    await queryInterface.addIndex('STUDENTS', ['GRADE', 'CLASS'], {
      name: 'idx_students_grade_class'
    });

    await queryInterface.addIndex('LESSONS', ['TEACHER_ID'], {
      name: 'idx_lessons_teacher'
    });

    await queryInterface.addIndex('LESSONS', ['GRADE'], {
      name: 'idx_lessons_grade'
    });

    await queryInterface.addIndex('ENROLLMENTS', ['STUDENT_ID'], {
      name: 'idx_enrollments_student'
    });

    await queryInterface.addIndex('ENROLLMENTS', ['LESSON_ID'], {
      name: 'idx_enrollments_lesson'
    });

    await queryInterface.addIndex('TIME_TABLE', ['GRADE', 'CLASS'], {
      name: 'idx_timetable_class'
    });

    await queryInterface.addIndex('TIME_TABLE', ['PERIOD', 'DAY_OF_WEEK'], {
      name: 'idx_timetable_period_day'
    });

    await queryInterface.addIndex('ATTENDANCE', ['DATE'], {
      name: 'idx_attendance_date'
    });

    await queryInterface.addIndex('ATTENDANCE', ['STUDENT_ID', 'DATE'], {
      name: 'idx_attendance_student_date'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ATTENDANCE');
    await queryInterface.dropTable('TIME_TABLE');
    await queryInterface.dropTable('TIME_SLOTS');
    await queryInterface.dropTable('ENROLLMENTS');
    await queryInterface.dropTable('LESSONS');
    await queryInterface.dropTable('STUDENTS');
    await queryInterface.dropTable('CLASSES');
    await queryInterface.dropTable('COURSES');
    await queryInterface.dropTable('TEACHERS');
    await queryInterface.dropTable('TENANTS');
  }
};