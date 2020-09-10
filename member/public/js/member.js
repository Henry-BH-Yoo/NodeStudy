var commMember =  (function() {
    checkId = function() {
        if(typeof localStorage != "undefiend" && localStorage != null) {
            if(localStorage.rememberMe) {
                $("#customCheck").prop("checked" , true);
                $("#userId").val(localStorage.userId); 
            }
        }
    }, 
    login = async function() {
            let loginInfo = new Object();
            loginInfo.userId = $("#userId").val();
            loginInfo.password = $("#password").val();
            loginInfo.rememberMe = false;
            if($("#customCheck").is(":checked")) {
                loginInfo.rememberMe = true;
            } 

            await fetch('/member/login', {
            method : 'POST',
            headers : {
                'Accept' : 'application/json',
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify(loginInfo)
            })
            .then(res => res.json())
            .then((data) => {
                if(data.errorMap.errorCode == "0000") {
                    localStorage.setItem("userId" , data.paramMap.userId);
                    localStorage.setItem("rememberMe" , true);

                    if(data.resultMap.loginSuccess) {
                        location.href = '/main/index';
                    } 
                } else {

                    localStorage.removeItem("userId");
                    localStorage.removeItem("rememberMe");

                    alert(data.errorMap.errorMessage);
                }
            })
            .catch(function(err) {
                console.log(err);
            })
    }


    register = async function() {
        let registerInfo = new Object();
        registerInfo.firstName = $("#firstName").val();
        registerInfo.lastName = $("#lastName").val();
        registerInfo.email = $("#email").val();
        registerInfo.password = $("#password").val();
        registerInfo.rePassword = $("#rePassword").val();
        

        await fetch('/member/register', {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(registerInfo)
        })
        .then(res => res.json())
        .then((data) => {
            if(data.errorMap.errorCode == "0000") {
                location.href = '/member/login';
                
            } else {
                alert(data.errorMap.errorMessage);
            }
        })
        .catch(function(err) {
            console.log(err);
        })
    }

    resetPassword = async function() {
        let userInfo = new Object();
        userInfo.email = $("#email").val();

        await fetch('/member/forgotPassword', {
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(userInfo)
        })
        .then(res => res.json())
        .then((data) => {
            if(data.errorMap.errorCode == "0000") {
                alert("메일이 발송되었습니다. 확인 후 로그인 하세요.");
                location.href = '/member/login';
            } else {
                alert(data.errorMap.errorMessage);
            }
        })
        .catch(function(err) {
            console.log(err);
        })
    }


    return {
        checkId : checkId ,
        login : login , 
        register : register ,
        resetPassword : resetPassword
    }

}());