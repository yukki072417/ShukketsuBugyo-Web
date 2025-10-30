export type Error = {
    status: number;
    message: string;
}

export function errorHandle(status: number): Error {

    let message: string;
    switch (status) {
        case 400:
            message = "正しくありません";
            break;
        case 401:
            message = "認証に失敗しました";
            break;
        case 403:
            message = "アクセス権限がありません";
            break;
        case 404:
            message = "データが見つかりませんでした";
            break;
        case 409:
            message = "データが重複しています";
            break;
        case 500:
            message = "サーバーエラーが発生しました";
            break;
        default:
            message = "予期しないエラーが発生しました";
            break;
    }

    return {
        status: status,
        message: message
    }
}
