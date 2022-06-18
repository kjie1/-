//封装ajax
/**
 * 
 * @param {object} options
 *                 method:方法
 *                 uel:路径
 *                 data:数据
 *                 isAsync:是否异步
 *                 success:成功的回调函数 
 *                 error:错误的提示信息
 */
function ajax(method, url, data, cb, isAsync) {
    // get   url + '?' + data
    // post
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                cb(JSON.parse(xhr.responseText));
            }
        }
    };
    method = method.toUpperCase();
    if (method == "GET") {
        xhr.open(method, url + "?" + data, isAsync);
        xhr.send();
    } else if (method == "POST") {
        xhr.open(method, url, isAsync);
        // key=value&key1=valu1
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
    }
}

// ajax({
//     method: "get",
//     url: "http://developer.duyiedu.com/edu/testAjaxCrossOrigin",
//     data: "appkey=kang_1612449952758",
//     success: function (data) {
//         console.log(data);
//     }
// })

//表格数据
var tableData = [];

//点击切换列表背景

function bindEvent() {
    var leftMenu = document.querySelector(".left-menu");
    leftMenu.onclick = function (e) {
        // console.log(e.target.parentNode);
        var ddNode = e.target.parentNode;  //ddNode 当前点击的节点
        if (ddNode.tagName == "DD") {
            removeClass(ddNode.parentNode.children, "menu-active");
            ddNode.className = "menu-active";
        }
    }

    //提交按钮点击行为
    var studentAddBtn = document.getElementById("student-add-btn");
    studentAddBtn.onclick = function (e) {
        // 阻止form表单默认刷新
        e.preventDefault();
        console.log("dsdd");

        //获取表单元素
        var form = document.getElementById("student-add-form");
        var formData = getFormData(form);
        if (formData.status === "success") {
            //添加当前学生的信息
            var data = formData.data;
            //将学生信息转化为字符串
            var dataStr = '';
            for (var prop in data) {
                dataStr += prop + "=" + data[prop] + "&";
            }

            transferData({
                method: "get",
                url: "/api/student/addStudent",
                data: dataStr,
                success: function (res) {
                    console.log(res);
                    alert('新增成功');
                    location.hash = '#student-list';
                    getTableData();
                }
            })
        } else {
            alert(formData.msg);
        }
    }

    //编辑删除功能  将事件绑定到tbody身上
    var tBody = document.querySelector("#student-list table tbody");
    var modal = document.querySelector("#student-list .modal");
    tBody.onclick = function (e) {
        //判断当前点击的是不是button按钮
        if (e.target.tagName === "BUTTON") {
            //获取当前标签身上的自定义属性data-index 的方法
            console.log(e.target.getAttribute('data-index'));
            //当前点击的对应的学生的索引值
            var index = e.target.dataset.index;
            //判断是不是编辑或删除按钮
            if (e.target.classList.contains("edit")) {

                //拿到当前学生的数据，并且渲染弹窗数据
                renderEditForm(tableData[index]);
                //进行编辑
                modal.style.display = "block";
            } else {
                //进行删除
                var student = tableData[index];
                var isDel = confirm('确认删除学号为：' + student.sNo + '的学生信息吗？');
                if (isDel) {
                    transferData({
                        method: 'get',
                        url: '/api/student/delBySno',
                        data: 'sNo=' + student.sNo + '&',
                        success: function () {
                            alert('删除成功');
                            getTableData();
                        }
                    })
                }
            }
        }
    }

    //点击遮罩层弹窗消失
    modal.onclick = function (e) {
        if (e.target === this) {
            modal.style.display = "none";
        }
    }

    var studentEditBtn = document.getElementById("student-edit-btn");
    studentEditBtn.onclick = function (e) {
        // 阻止form表单默认刷新
        e.preventDefault();

        //获取表单元素
        var form = document.getElementById("student-edit-form");
        var formData = getFormData(form);
        if (formData.status === "success") {
            //添加当前学生的信息
            var data = formData.data;
            //将学生信息转化为字符串
            var dataStr = '';
            for (var prop in data) {
                dataStr += prop + "=" + data[prop] + "&";
            }

            transferData({
                method: "get",
                url: "/api/student/updateStudent",
                data: dataStr,
                success: function (res) {
                    console.log(res);
                    alert('修改成功');
                    getTableData();
                    modal.style.display = "none";
                    // getTableData();
                    //   location.hash = '#student-list';
                }
            });
        } else {
            alert(formData.msg);
        }
    }

}

//删除上一个类名
function removeClass(nodeList, className) {
    for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].classList.remove(className);
    }
}

window.onload = function () {
    bindEvent();
    hashToMenu();
    window.onhashchange = function () {
        hashToMenu();
    }
}


//hash值对应的页面
function hashToMenu() {
    if (location.hash) {
        var hashName = location.hash;
        var activeMenu = document.querySelector('.left-menu dd a[href="' + hashName + '"]');
        activeMenu.click();
    }
}

//获取学生的表单数据
function getFormData(form) {
    var name = form.name.value;
    var sex = form.sex.value;
    var email = form.email.value;
    var sNo = form.sNo.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;


    //最终返回的信息
    var result = {
        data: {},  //表单所有信息
        status: "success",  //表单是否校验成功
        msg: ""     //表单校验不成功，提示的信息
    }

    //首先判断用户是否填写完整
    if (!name || !email || !sNo || !birth || !phone || !address) {
        result.status = "fail";
        result.msg = "请填写完整";
        return result;
    }

    //规定email格式
    var emailReg = /^[\w\._-]+@[\w\._-]+[\w]$/;
    if (!emailReg.test(email)) {
        result.status = "fail";
        result.msg = "邮箱格式错误";
        return result;
    }

    //判断学号的格式
    var sNoReg = /^[\d]{4,16}$/;
    if (!sNoReg.test(sNo)) {
        result.status = "fail";
        result.msg = "学号格式错误";
        return result;
    }

    //判断出生年的格式
    var birthReg = /^(19|20)+[\d]{2}$/;
    if (!birthReg.test(birth)) {
        result.status = "fail";
        result.msg = "出生年格式错误";
        return result;
    }

    //手机号格式
    var phoneReg = /^1[3456789][\d]{9}$/;
    if (!phoneReg.test(phone)) {
        result.status = "fail";
        result.msg = "手机号格式错误";
        return result;
    }

    //
    result.data = {
        name,
        sex,
        email,
        sNo,
        birth,
        phone,
        address
    }




    return result;
}

//封装一个调用ajax的方法
function transferData(options) {
    ajax(options.method || "GET", "http://open.duyiedu.com" + options.url, options.data + "appkey=kang_1612449952758",
        function (res) {
            if (res.status === "fail") {
                alert(res.msg);
            } else {
                options.success(res.data);
            }
        }, true);
}

//获取表格数据 
function getTableData() {
    transferData({
        method: "get",
        url: "/api/student/findAll",
        data: "",
        success: function (res) {
            tableData = res;
            renderTable(res)
        }
    })
}

getTableData();

//渲染页面
function renderTable(data) {
    // pre:上一项，ele：每一项
    var str = data.reduce(function (pre, ele, index) {
        return pre + `<tr>
        <td>${ele.sNo}</td>
        <td>${ele.name}</td>
        <td>${ele.sex == 0 ? "男" : "女"}</td>
        <td>${ele.email}</td>
        <td>${new Date().getFullYear() - ele.birth}</td>
        <td>${ele.phone}</td>
        <td>${ele.address}</td>
        <td>
            <button class="operation-btn edit" data-index=${index}>编辑</button>
            <button class="operation-btn remove" data-index=${index}>删除</button>
        </td>
    </tr>`
    }, "");
    //有了str接下来往body里面渲染
    var tbody = document.querySelector("#student-list table tbody");
    tbody.innerHTML = str;
}



//渲染弹窗
function renderEditForm(data) {
    //  编辑表单元素
    var form = document.getElementById("student-edit-form");
    // 遍历当前学生的信息
    for (var prop in data) {
        // 判断表单当中是否有这个数据
        if (form[prop]) {
            form[prop].value = data[prop];
        }
    }
}


// 点击遮罩层小时、、