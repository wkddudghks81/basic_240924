//pull requests 실습을 위한 주석
//1 아이디 ,비밀번호 로직 함수로 만들기
//2 api들 라우터로 만들기
//3 joi 미들웨어로 빼기
import express from "express";
import Joi from "joi";

const userInfos = []; //데이터 베이스

const app = express();

app.use(express.json()); //body json형태 요청을 받기 위해

const port = "924";

const password_pattern = /^[a-z|A-Z|0-9]+$/; // userId는 알파벳 대소문자 (a~z, A~Z), 숫자(0~9)로 구성

const signupschema = Joi.object({
  //이메일 형식이고 필수로 존재
  id: Joi.string().email().required(),
  name: Joi.string().min(3).max(10).required(),
  password: Joi.string()
    .min(6)
    .max(10)
    .pattern(new RegExp(password_pattern))
    .required(),
  age: Joi.number(),
  userID: Joi.number(),
});

const signinschema = Joi.object({
  //이메일 형식이고 필수로 존재
  id: Joi.string().email().required(),
  password: Joi.string()
    .min(6)
    .max(10)
    .pattern(new RegExp(password_pattern))
    .required(),
});

const changeNameschema = Joi.object({
  //이메일 형식이고 필수로 존재
  id: Joi.string().email().required(),
  name: Joi.string().min(3).max(10).required(),
  password: Joi.string()
    .min(6)
    .max(10)
    .pattern(new RegExp(password_pattern))
    .required(),
});

// let check = userInfos.findIndex(function (data) {
//   return data.id === id;
// });

function checkid(id) {
  //id와 동일한 데이터를 찾아서 index 반환, 없으면 -1 반환
  return userInfos.findIndex(function (data) {
    return data.id === id; //data=useInfos
  });
}

function accountcheck(id, password, res) {
  let Checkid = checkid(id);
  if (Checkid === -1) {
    // id와 동일한 데이터를 찾아서 index 반환, 없으면 -1 반환
    res.status(404).json("아이디가 존재하지 않습니다"), "no exist";
  }
  if (password === userInfos[Checkid].password) {
    return "success";
  } else {
    res.status(409).json("로그인 실패. 비밀번호를 다시 입력하십시오"), "fail";
  }
}

//회원가입
app.post("/sign-up", async (req, res) => {
  try {
    let { id, name, password, age } = req.body; //body에서 읽어옴
    let userID; //회원 정보 ID
    if (userInfos.length === 0) {
      userID = 0;
    } else {
      userID = userInfos[userInfos.length - 1].userID + 1; //데이터 베이스에 있는 가장 높은값 +1
    }
    const plus = {
      id,
      name,
      password,
      age,
      userID: userID,
    };
    await signupschema.validateAsync(plus);
    let Checkid = checkid(id); //index 변수에 할당
    if (0 <= Checkid) {
      //index가 하나라도 존재한다면 동일한 id가 존재한다는 뜻
      res.status(409).json("동일한 아이디가 존재합니다.");
    } else {
      userInfos.push(plus);
      res.send(userInfos[userInfos.length - 1]);
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(409).json(error.message), console.log(error);
    }
    res.status(500).send("서버 내부 오류가 발생했습니다.");
    console.log(error);
    console.log(error.name);
  }
});

//로그인
app.post("/sign-in", async (req, res) => {
  try {
    let { id, password } = req.body;
    await signinschema.validateAsync(req.body);
    // let Checkid = checkid(id)
    // if(Checkid === -1){         //id와 동일한 데이터를 찾아서 index 반환, 없으면 -1 반환
    //   return res.status(404).json("아이디가 존재 하지 않습니다")
    // }
    // if(password === userInfos[Checkid].password){
    //   return res.status(200).json("로그인 성공")
    // }else{
    //   return res.status(409).json("로그인 실패. 비밀번호를 다시 입력하십시오")
    // }
    if (accountcheck(id, password, res) === "success") {
      return res.status(200).json("로그인 성공");
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(409).json(error.message), console.log(error);
    }
    res.status(500).json("서버 내부 오류가 발생했습니다.");
    console.log(error);
  }
});

//유저 정보 조회
app.get("/secret/uesrinfos", (req, res) => {
  try {
    res.send(userInfos);
  } catch (error) {
    res.status(500).send("서버 내부 오류가 발생했습니다.");
    console.log(error);
  }
});

//이름 변경
app.patch("/changeName", async (req, res) => {
  try {
    let { id, name, password } = req.body;
    await changeNameschema.validateAsync(req.body);
    // let Checkid = checkid(id)
    // if(Checkid === -1){
    //   return res.status(404).json("아이디가 존재 하지 않습니다")
    // }
    // if(password === userInfos[Checkid].password){
    //   userInfos[Checkid].name = name      //body에 적은 name으로 변경
    //   res.send(userInfos[Checkid]);
    // }else{
    //   return res.status(409).json("로그인 실패. 비밀번호를 다시 입력하십시오")
    // }
    let Checkid = checkid(id);
    if (accountcheck(id, password, res) === "success") {
      userInfos[Checkid].name = name; //body에 적은 name으로 변경
      res.send(userInfos[Checkid]);
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(409).json(error.message), console.log(error);
    }
    res.status(500).send("서버 내부 오류가 발생했습니다.");
    console.log(error);
  }
});

//유저 삭제
app.delete("/withdraw", async (req, res) => {
  try {
    let { id, password } = req.body;
    await signinschema.validateAsync(req.body);
    // let Checkid = checkid(id)
    // if(Checkid === -1){
    //   return res.status(404).json("아이디가 존재 하지 않습니다")
    // }
    // if(password === userInfos[Checkid].password){
    //   userInfos.splice(Checkid,1)     //index 부터 index 포함 1개 데이터 삭제
    //   return res.status(200).json("삭제 성공")
    // }else{
    //   return res.status(409).json("로그인 실패. 비밀번호를 다시 입력하십시오")
    // }
    let Checkid = checkid(id);
    if (accountcheck(id, password, res) === "success") {
      userInfos.splice(Checkid, 1); //index 부터 index 포함 1개 데이터 삭제
      return res.status(200).json("삭제 성공");
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(409).json(error.message), console.log(error);
    }
    res.status(500).send("서버 내부 오류가 발생했습니다.");
    console.log(error);
  }
});

//서버 open
app.listen(port, (req, res) => {
  console.log(port + " 포트 번호로 서버가 열렸습니다");
});
