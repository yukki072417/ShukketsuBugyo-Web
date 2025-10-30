# API命名規則

## JSONキー命名規則

### 基本ルール
- **snake_case**を使用（例: `student_id`, `first_name`）
- 略語は避け、明確な名前を使用
- 一貫性を保つ

### データベースカラム名との対応
- データベース: `UPPER_CASE` (例: `STUDENT_ID`)
- API JSON: `snake_case` (例: `student_id`)

### 標準フィールド名

#### 識別子
- `tenant_id` - テナントID
- `student_id` - 学籍番号
- `teacher_id` - 教師ID
- `course_id` - コースID

#### 個人情報
- `first_name` - 名
- `last_name` - 姓
- `furigana_first_name` - フリガナ（名）
- `furigana_last_name` - フリガナ（姓）

#### 学校情報
- `grade` - 学年
- `class` - クラス
- `number` - 出席番号
- `subject_name` - 科目名
- `subject_name_en` - 科目名（英語）

#### 時間関連
- `time_slot` - 時限
- `start_time` - 開始時間
- `end_time` - 終了時間
- `day_of_week` - 曜日（1=月曜〜7=日曜）
- `date` - 日付（YYYY-MM-DD）

#### 出席関連
- `status` - 出席状態（数値）
- `status_name` - 出席状態名（文字列）

### レスポンス形式
- 成功: データ配列またはオブジェクト
- エラー: `{"message": "エラーメッセージ", "reason": "詳細理由"}`
- 一括処理: `{"results": [{"index": 0, "status": "SUCCESS", "item": {...}}]}`

### プログラム命名規則
- 関数: **camelCase**を使用（例: `getStudentInfo`, `updateAttendance`）
- 変数: **camelCase**を使用（※例外あり）（例: `studentID`, `studentName`）
    - #### 以下変数の命名規則の例外
        - IDが変数名に含まれる場合は、"ID" を大文字として表現する
        - `_class`などの変数名があるが、classは予約語のため、`_`を先頭につける
- 引数 **camelCase**を使用
- 定数 **camelCase**を使用
- typescript特有の型
    - 型名は**PascalCase**を使用（例: `StudentInfo`, `AttendanceStatus`）