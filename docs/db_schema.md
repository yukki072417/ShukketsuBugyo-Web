# SHUKKETSU_BUGYO データベーススキーマ

## 概要

SHUKKETSU_BUGYO（出欠奉行）は学校の出席管理システムのためのデータベースです。マルチテナント対応で、複数の学校や教育機関が同一システムを利用できる構成になっています。

### データベース設定
- 文字セット: `utf8mb4`
- 照合順序: `utf8mb4_unicode_ci`

## テーブル構成

### 1. TENANTS（テナント）
マルチテナント対応のための組織・学校情報を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY | テナントID |
| TENANT_NAME | VARCHAR(255) | NOT NULL | テナント名（日本語） |
| TENANT_NAME_EN | VARCHAR(255) | NOT NULL | テナント名（英語） |

### 2. TEACHERS（教員）
教員の情報を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| TEACHER_ID | VARCHAR(20) | PRIMARY KEY | 教員ID |
| PASSWORD | VARCHAR(255) | NOT NULL | パスワード |
| MANAGER | BOOLEAN | NOT NULL, DEFAULT 0 | 管理者フラグ |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)

### 3. COURSES（コース）
※現時点では不要とのコメントがありますが、将来的な拡張のために残されています。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| COURSE_ID | CHAR(36) | PRIMARY KEY | コースID（UUID） |
| COURSE_NAME | VARCHAR(50) | NOT NULL | コース名（日本語） |
| COURSE_NAME_EN | VARCHAR(50) | NOT NULL | コース名（英語） |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)

### 4. CLASSES（クラス）
学年・クラス情報と担任教員の関係を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| TEACHER_ID | VARCHAR(20) | FK | 担任教員ID |
| GRADE | CHAR(1) | PRIMARY KEY | 学年（1文字） |
| CLASS | VARCHAR(15) | PRIMARY KEY | クラス（〇〇学級のような名前を想定） |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)
- (TENANT_ID, TEACHER_ID) → TEACHERS(TENANT_ID, TEACHER_ID)

### 5. STUDENTS（生徒）
生徒の基本情報を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| STUDENT_ID | VARCHAR(20) | PRIMARY KEY | 生徒ID |
| PASSWORD | VARCHAR(255) | NOT NULL | パスワード |
| GRADE | CHAR(1) | NOT NULL, FK | 学年 |
| CLASS | VARCHAR(15) | NOT NULL, FK | クラス |
| NUMBER | TINYINT | NOT NULL | 出席番号 |
| COURSE_ID | CHAR(36) | FK, NULL可 | コースID |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)
- (TENANT_ID, COURSE_ID) → COURSES(TENANT_ID, COURSE_ID)
- (TENANT_ID, GRADE, CLASS) → CLASSES(TENANT_ID, GRADE, CLASS)

### 6. LESSONS（授業）
授業科目の情報を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | NOT NULL, FK | テナントID |
| LESSON_ID | CHAR(36) | PRIMARY KEY | 授業ID（UUID） |
| TEACHER_ID | VARCHAR(20) | NOT NULL, FK | 担当教員ID |
| LESSON_NAME | VARCHAR(255) | NULL可 | 授業名（日本語） |
| LESSON_NAME_EN | VARCHAR(255) | NULL可 | 授業名（英語） |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)
- (TENANT_ID, TEACHER_ID) → TEACHERS(TENANT_ID, TEACHER_ID)

**インデックス:**
- idx_lessons_tenant_id (TENANT_ID)
- idx_lessons_teacher_id (TEACHER_ID)

### 7. ENROLLMENTS（履修登録）
生徒と授業の履修関係を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | NOT NULL, FK | テナントID |
| ENROLLMENT_ID | CHAR(36) | PRIMARY KEY | 履修登録ID（UUID） |
| STUDENT_ID | VARCHAR(20) | NOT NULL, FK | 生徒ID |
| LESSON_ID | CHAR(36) | NOT NULL, FK | 授業ID |
| STATUS | TINYINT | NOT NULL, DEFAULT 0　| ステータス（0=未登録, 1=登録済, 2=保留中） |

**制約:**
- UNIQUE KEY unique_student_lesson (STUDENT_ID, LESSON_ID)

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)
- (TENANT_ID, STUDENT_ID) → STUDENTS(TENANT_ID, STUDENT_ID)
- LESSON_ID → LESSONS(LESSON_ID)

**インデックス:**
- idx_enrollments_tenant_id (TENANT_ID)
- idx_enrollments_student_id (STUDENT_ID)
- idx_enrollments_lesson_id (LESSON_ID)

### 8. TIME_SLOTS（時限）
授業の時限（時間帯）を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| TIME_SLOT | VARCHAR(10) | PRIMARY KEY | 時間目 |
| START_TIME | TIME | NOT NULL | 開始時刻 |
| END_TIME | TIME | NOT NULL | 終了時刻 |

### 備考
TIME_SLOTにはHR(ホームルーム)などが入ることを想定する

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)

### 9. TIME_TABLE（時間割）
授業スケジュール（時間割）を管理します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| LESSON_ID | CHAR(36) | PRIMARY KEY, FK | 授業ID |
| TIME_SLOT | TINYINT | PRIMARY KEY, FK | 時限番号 |
| DAY_OF_WEEK | TINYINT | PRIMARY KEY | 曜日（1=月曜日...7=日曜日） |
| GRADE | CHAR(1) | PRIMARY KEY, FK | 学年 |
| CLASS | VARCHAR(15) | PRIMARY KEY, FK | クラス |

**外部キー制約:**
- LESSON_ID → LESSONS(LESSON_ID)
- (TENANT_ID, GRADE, CLASS) → CLASSES(TENANT_ID, GRADE, CLASS)
- (TENANT_ID, TIME_SLOT) → TIME_SLOTS(TENANT_ID, TIME_SLOT)

**インデックス:**
- idx_time_table_tenant_id (TENANT_ID)
- idx_time_table_lesson_id (LESSON_ID)

### 10. ATTENDANCE（出席）
生徒の出席状況を記録する中心的なテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| TENANT_ID | VARCHAR(30) | PRIMARY KEY, FK | テナントID |
| STUDENT_ID | VARCHAR(20) | PRIMARY KEY, FK | 生徒ID |
| LESSON_ID | CHAR(36) | PRIMARY KEY, FK | 授業ID |
| DATE | DATE | PRIMARY KEY | 日付 |
| TIME_SLOT | TINYINT | PRIMARY KEY | 時限番号 |
| STATUS | TINYINT | NOT NULL, DEFAULT 0 | 出席ステータス |
| NOTES | TEXT | NULL可 | 備考 |

**外部キー制約:**
- TENANT_ID → TENANTS(TENANT_ID)
- (TENANT_ID, STUDENT_ID) → STUDENTS(TENANT_ID, STUDENT_ID)
- LESSON_ID → LESSONS(LESSON_ID)

**インデックス:**
- idx_attendance_date (DATE)
- idx_attendance_time_slot (TIME_SLOT)
- idx_attendance_tenant_id (TENANT_ID)
- idx_attendance_student_id (STUDENT_ID)
- idx_attendance_lesson_id (LESSON_ID)

## 追加インデックス

パフォーマンス向上のために以下のインデックスが追加されています：

- idx_course_tenant_id on COURSES(TENANT_ID)
- idx_classes_tenant_id on CLASSES(TENANT_ID)
- idx_students_tenant_id on STUDENTS(TENANT_ID)
- idx_teachers_tenant_id on TEACHERS(TENANT_ID)

## データ整合性

- すべてのテーブルでマルチテナント対応のためTENANT_IDが必須
- CASCADE DELETE/UPDATEにより、上位データの削除・更新時に関連データも自動的に処理
- ENROLLMENT_IDやLESSON_ID等でUUID（CHAR(36)）を使用してグローバルユニークを保証
- 出席ステータスは数値（TINYINT）で管理（0=出席、1=遅刻、2=欠席等を想定）

## 想定される運用

1. **テナント管理**: 各学校・教育機関がテナントとして登録
2. **ユーザー管理**: 教員と生徒がそれぞれ認証情報を持つ
3. **クラス編成**: 学年・クラスと担任教員の関係を定義
4. **授業設定**: 科目と担当教員、履修生徒を登録
5. **時間割作成**: 授業の曜日・時限を設定
6. **出席管理**: 日々の出席状況を記録・管理