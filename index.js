// console.log('hello server'); 테스트
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const multer = require('multer'); // 불러오기
app.use(express.static("public")); //public이라는 폴더에 있는 파일에 접근 할 수 있도록 설정


const fs = require("fs"); // 파일을 읽어오도록 해줌
const dbinfo = fs.readFileSync("./database.json");
const conf = JSON.parse(dbinfo); // json데이터를 객체 형태로 변경

const bcrypt = require("bcrypt");
const saltRounds = 10;

// use는 앱에 대한 설정 json형식으로 정보를 전달하겠다.
// json 형식의 데이터를 처리할 수 있게 설정하는 코드
app.use(express.json());

// 모든 브라우저에서 요청을 할수있게해줌
// 브라우저의 CORS 이슈를 막기 위해 사용하는 코드
app.use(cors());

// connection mysql연결 🧡
// createConnection()
// connection.connect() 연결하기
// connection.end() 연결종료
// connection.query('쿼리문', callback함수) → 쿼리문 넘겨주기, 잘되었는지 결과받기
// callback(error, result, field) → 에러, 결과, 결과의 필드정보

// mysql 쿼리 => select, update, delete, insert 🧡
// connection.query("쿼리문", 함수(에러, 결과, 결과의 필드정보) => {})

// select문 💜
// select * from 테이블명
// where no= 값

// 등록하기 💜
// insert into 테이블(컬럼1, 컬럼2, 컬럼3,...) values("값1", "값2", "값3",...)
// 더 쉽게 ↓
// query("쿼리", [값1, 값2, 값3,...]) => 배열 넣기 💚
// insert into 테이블(컬럼1, 컬럼2, 컬럼3,...) values(?,?,?,...)

// 삭제하기 💜
// delete 쿼리문
// delete from 테이블명 조건절
// delete from customers_table where no = ${params.no}

// 정보 수정하기 💜
// update 테이블이름 set 컬럼명 = 값   where no = 값
// update customers_table
// set name='', phone='', birth ='', gender='', add1='', add2=''
// where no =
// 업데이트는 put으로 받기

const connection = mysql.createConnection({
    host : conf.host,
    user : conf.user,
    password : conf.password,
    port : conf.port,
    database : conf.database,
})


// const corsOptions = {
//     origin : "http://localhost:3001",
// };
// app.use(cors(corsOptions));

// app.get('/api', (req, res) => {
//     res.header("Access-Control-Allow-Origin", "http://localhost:3001");
//     res.send(data);
// })

    // Bcrypt를 사용하여 비밀번호 암호화하기 getsalt(), hashpw(), checkpw()
    // 암호화하지 않고 그대로 저장하는 것은 불법
    // 등록일은 Now()함수를 사용하여 생성

    // gensalt()
    // 메서드는 소금 생성기, 소금을 생성하는 메서드이다.
    // 솔트(salt)를 생성하는데 솔트는 해시 함수에서
    // 암호화된 비밀번호를 생성할 때 추가되는 바이트 단위의 임의의 문자열이다. 

    // hashpw(password, salt)
    // 비밀번호와 salt를 인자로 받아 암호화된 비밀번호를 생성한다.
    
    // checkpw(password, hashedPassword)
    // boolean 타입으로 비밀번호와 암호화된 비밀번호를 인자로 받아
    // 같을 경우 true, 다를 경우 false를 반환한다.
// 💛 회원가입
app.post("/join", async(req, res) => {
    let myPlanintextPass = req.body.userpass;
    let myPass = "";
    if(myPlanintextPass != '' && myPlanintextPass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                myPass = hash;
                const { username, userpass, useradd , userphone, userdate, usermail, gender, usersms, userbirth } = req.body;
                // console.log(req.body);
                connection.query("insert into customer_members(`username`, `userpass`, `useradd`, `userphone`, `usermail`, `userdate`, `gender`, `usersms`, `userbirth`) values(?,?,?,?,?, DATE_FORMAT(now(), '%Y-%m-%d'),?,?,?)",
                [username, myPass, useradd, userphone, usermail, gender, usersms, userbirth],
                (err, result, fields) => {
                    // console.log(result);
                    // console.log(err);
                    res.send("등록되었습니다.");
                })
            })
        })
    }
})

// 💛 로그인
app.post('/login', async(req, res) => {
    const { usermail, userpass } = req.body;
    // console.log(req.body);
    connection.query(
        `select * from customer_members where usermail = '${usermail}'`,
        (err, rows, fields) => {
            if(rows != undefined) {
                if(rows[0] == undefined) {
                    res.send(null)
                } else {
                    bcrypt.compare(userpass, rows[0].userpass, function(err, login_flag) {
                        if(login_flag == true) {
                            res.send(rows[0])
                            // console.log("이거");
                        } else {
                            res.send(null)
                            // console.log("저거");
                        }
                    })
                }
            } else {
                res.send(null)
            }
        }
    )
})

// 💛 전체 회원정보 조회
app.get("/host", async (req, res) => {
    // console.log(no);
    connection.query(
        `select * from customer_members order by username asc`,
        (err, rows, fields) => {
            // console.log(rows);
            res.send(rows);
        }
    )
})

// 💛 마이페이지
    // 💛 회원정보 조회
    app.get("/mypageCustomer/:no", async (req, res) => {
        const params = req.params;
        const {no} = params;
        connection.query( 
            `select * from customer_members where usermail = '${no}'`,
            (err, rows, fields) => {
                res.send(rows[0]);
            }
        )
    })
    // 💛 내 회원정보 수정
    app.put("/editCustomer/:no", async (req, res) => {
        const params = req.params;
        console.log(params);
        const { my_username,my_useradd,my_userphone,my_userbirth,my_usersms,my_usermail,my_gender} = req.body;
        connection.query(
            `update customer_members 
            set username='${my_username}', useradd='${my_useradd}', userphone='${my_userphone}', userbirth='${my_userbirth}', usersms='${my_usersms}', usermail='${my_usermail}', gender='${my_gender}' 
            where no='${params.no}'`,
            (err, rows, fields) => {
                console.log(rows);
                res.send(rows);
            }
        )
    })

    // 💛 mypage에서 내 문의글 보기
    app.get("/mypageContact/:id", async (req, res) => {
        const params = req.params;
        const {id} = params;
        connection.query(
            `select * from contact where usermail='${id}'`,
            (err, rows, fields) => {
                res.send(rows);
                // console.log(rows[0]);
            }
        )
    })
    // 💛 내 문의글 삭제
    app.post("/mypageConDel/:no", async (req, res) => {
        const params = req.params;
        const {no} = params;
        // console.log(params);
        connection.query(
            `delete from contact where no='${no}'`,
            (err, rows, fields) => {
                res.send(rows);
            }
        )
    })
    // 💛 mypage에서 내 팬글 보기
    app.get("/mypageComment/:id", async (req, res) => {
        const params = req.params;
        const {id} = params;
        connection.query(
            `select * from comment where email='${id}'`,
            (err, rows, fields) => {
                res.send(rows);
                // console.log(rows[0]);
            }
        )
    })
    // 💛 내 팬글 삭제
    app.post("/mypageComDel/:no", async (req, res) => {
        const params = req.params;
        const {no} = params;
        // console.log(params);
        connection.query(
            `delete from comment where no='${no}'`,
            (err, rows, fields) => {
                res.send(rows);
            }
        )
    })

// 💛 HOST 페이지, 회원 삭제
app.post("/hostCusDelete/:no", async (req, res) => {
    const params = req.params;
    const {no} = params;
    // console.log(params);
    connection.query(
        `delete from customer_members where no='${no}'`,
        (err, rows, fields) => {
            res.send(rows);
        }
    )
})

// 💛 선수 등록
app.post("/host", async (req, res) => {
    const { name, number, national, place, position, dob, height, debut, mainimg, serveimg } = req.body;
    connection.query(
        "insert into playerlist(`name`, `number`, `national`, `place`, `position`, `dob`, `height`, `debut`, `mainimg`, `serveimg`) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [name, number, national, place, position, dob, height, debut, mainimg, serveimg],
        (err, rows, fields) => {
            // console.log(rows);
            // console.log(err);
            res.send('선수 등록 완료');
        }
    )
})
    // 이미지 저장
    const storage = multer.diskStorage({
        destination : function(req, res, cb) {
            cb(null, 'public/player/')
        },
        filename : function(req, file, cb) {
            cb(null, file.originalname);
        }
    })
    // 파일 사이즈 지정
    const upload = multer({
        storage : storage,
        limits : { fileSize : 30000000 }
    })
    // 받아서 보내줌
    app.post("/upload", upload.array("image"), function(req, res) {
        // const file = req.file;
        const fileList = req.files;
        // console.log(fileList);
        res.send({fileList});
    })

// 💛 티켓 등록
app.post("/hostTicket", async (req, res) => {
    const { Kickoff, awaylogo, awayname, gamedate, stadium, tkname, tkdate, tkprice, month} = req.body;
    connection.query(
        "INSERT INTO `football`.`ticket` (`Kickoff`, `awaylogo`, `awayname`, `gamedate`, `stadium`, `tkname`, `tkdate`, `tkprice`, `month`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [Kickoff, awaylogo, awayname, gamedate, stadium, tkname, tkdate, tkprice, month],
        (err, rows, fields) => {
            res.send('티켓 등록 완료');
        }
    )
})
    // 이미지 저장
    const storage2 = multer.diskStorage({
        destination : function(req, res, cb) {
            cb(null, 'public/ticket/')
        },
        filename : function(req, file, cb) {
            cb(null, file.originalname);
        }
    })
    // 파일 사이즈 지정
    const upload2 = multer({
        storage : storage2,
        limits : { fileSize : 30000000 }
    })
    // 받아서 보내줌
    app.post("/upload2", upload2.array("image2"), function(req, res) {
        const fileList2 = req.files;
        res.send({fileList2});
    })

// 💛 티켓 구매
app.get("/match", async (req, res) => {
    connection.query(
        "select * from ticket", (err, rows, fields) => {
            // console.log(rows);
            res.send(rows);
        }
    )
})

// 💛 선수 List 보기
app.get("/suhan", async (req, res) => {
    connection.query(
        "select * from playerlist order by name asc", (err, rows, fields) => {
            // console.log(rows);
            res.send(rows);
        }
    )
})

// 💛 선수 개별 보기
app.get("/playerMore/:name", async (req, res) => {
    // const {name} = req.params;
    const params = req.params;
    const name = params.name;
    connection.query(
        `select * from playerlist where name='${name}'`,
        (err, rows, fields) => {
            res.send(rows[0]);
        }
    )
})

// 💛 문의글 작성하기
app.post("/textContact", async (req, res) => {
    const { username, title, content, answer, date, secret, keyword,usermail } = req.body;
    // console.log();
    connection.query(
        // DATE_FORMAT(now(), '%Y-%m-%d')
        "insert into contact (`username`, `title`, `content`, `date`,  `answer`, `secret`, `keyword`,`usermail`) values(?, ?, ?, ?, ?, ?, ?, ?)",
        [username, title, content, answer, secret,keyword, usermail, date],
        (err, rows, fields) => {
            res.send("문의글 등록완료");
        }
    )
})

// 💛 전체 문의글 보기
app.get("/contact", async (req, res) => {
    connection.query(
        "select * from contact", // order by date desc",
        (err, rows, fields) => {
            res.send(rows);
            // console.log(rows);
        }
    )
})

// 💛 팬글 작성하기
app.post("/playerFan", async (req, res) => {
    const { id, like, comment, best, player, email } = req.body;
    connection.query(
        "insert into comment (`id`, `like`, `comment`, `best`, `player`, `email`) values (?, ?, ?, ?, ?, ?)",
        [id, like, comment, best, player, email],
        (err, rows, fields) => {
            res.send("팬글 등록완료");
        }
    )
})

// 💛 팬글 보기
app.get("/playerMorefan/:player", async (req, res) => {
    const {player} = req.params;
    // console.log(player);
    connection.query(
        `select * from comment where player='${player}'`,
        (err, rows, fields) => {
            // console.log(rows);
            res.send(rows);
        }
    )
})





// 💛 서버실행
app.listen(port, () => {
    console.log("고객 서버가 돌아가고 있습니다.");
})