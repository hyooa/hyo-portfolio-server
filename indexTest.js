// console.log('hello server'); 테스트
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3001;
const mysql = require("mysql");
const fs = require("path"); // 파일을 읽어오도록 해줌
const dbinfo = fs.readFileSync("./database.json");
const conf = JSON.parse(dbinfo); // json데이터를 객체 형태로 변경

const bcrypt = require("bcrypt");
const saltRounds = 10;


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

app.use(express.json());
app.use(cors());

// 회원가입
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

app.post("/join", async(req, res) => {
    let myPlanintextPass = req.body.userpass;
    let myPass = "";
    if(myPlanintextPass != '' && myPlanintextPass != undefined) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(myPlanintextPass, salt, function(err, hash) {
                myPass = hash;
                const { username, userpass, useradd , userphone, userbirth, usersms, userdate, usermail } = req.body;
                console.log(req.body);
                connection.query("insert into costomer_members(`username`, `userpass`, `useradd`, `userphone`, `userbirth`, `usersms`, `usermail`, `userdate`) values(?,?,?,?,?,?,?, DATE_FORMAT(now(), '%Y-%m-%d'))"),
                [username, myPass, useradd, userphone, userbirth, usersms, usermail],
                (err, result, fields) => {
                    console.log(result);
                    console.log(err);
                    res.send("등록되었습니다.");
                }
            })
        })
    }
})