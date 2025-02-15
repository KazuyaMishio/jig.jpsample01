import { serveDir } from "https://deno.land/std@0.223.0/http/file_server.ts";
let previousWord = "しりとり";
Deno.serve(async (request) => {
     // パス名を取得する
    // http://localhost:8000/hoge に接続した場合"/hoge"が取得できる
    const pathname = new URL(request.url).pathname;
    console.log(`pathname: ${pathname}`);
     
    // GET /shiritori: 直前の単語を返す
    if (request.method === "GET" && pathname === "/shiritori") {
        if(previousWord == "しりとり"){
            const s = [previousWord];
            const j = JSON.stringify(s);
            localStorage.setItem('j',j);
        }
        return new Response(previousWord);
    }
    //リセット
    if(request.method === "RESET" && pathname === "/shiritori"){
        const JsonWord = await request.json();
        const resetWord = JsonWord["resetWord"]
        previousWord = resetWord;
        return new Response(previousWord);
    }
    // POST /shiritori: 次の単語を入力する
    if (request.method === "POST" && pathname === "/shiritori") {
        // リクエストのペイロードを取得
        let i=0;
        const requestJson = await request.json();
        // JSONの中からnextWordを取得
        const nextWord = requestJson["nextWord"];
        let storedArray = localStorage.getItem('j');
        var e = JSON.parse(storedArray);
        console.log(typeof e);
        if(Array.isArray(e)){
            e.push(nextWord);
        }
        const d = e.length;
        while(i<d-1){
            if(e[i] != nextWord){ 
            }else{
                return new Response(
                    JSON.stringify({
                        "errorMessage": "過去に使われた単語です",
                        "errorCode": "10001"
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json; charset=utf-8" },
                    }
                );
            }
            i=i+1;
        }
        // previousWordの末尾とnextWordの先頭が同一か確認
        if (previousWord.slice(-1) === nextWord.slice(0, 1)) {
            // 同一であれば、previousWordを更新
            previousWord = nextWord;
        }
        // 同一でない単語の入力時に、エラーを返す
        else {
            return new Response(
                JSON.stringify({
                    "errorMessage": "前の単語に続いていません",
                    "errorCode": "10001"
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json; charset=utf-8" },
                }
            );
        }
        // 現在の単語を返す
        const t = JSON.stringify(e);
        localStorage.setItem('j',t);
        return new Response(previousWord);
    }

    // ./public以下のファイルを公開
    return serveDir(
        request,
        {
            /*
            - fsRoot: 公開するフォルダを指定
            - urlRoot: フォルダを展開するURLを指定。今回はlocalhost:8000/に直に展開する
            - enableCors: CORSの設定を付加するか
            */
            fsRoot: "./public/",
            urlRoot: "",
            enableCors: true,
        }
    );
});