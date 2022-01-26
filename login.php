<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        body {
            width: 35em;
            margin: 0 auto;
            font-family: Tahoma, Verdana, Arial, sans-serif;
        }

        .obstacle {
            position: absolute;
        }

        img {
            position: absolute;
        }

        .Plane {
            transform: rotate(270deg);
            position: absolute;
            top: 175px;
            width: 200px;
            height: 200px;
            cursor: pointer;
            animation-name: blink;
            animation-duration: 2s;
            animation-iteration-count: infinite;
        }

        @keyframes blink {
            0% {
                opacity: 0;
            }

            50% {
                opacity: 1;
            }

            100% {
                opacity: 0;
            }
        }
    </style>
    <title>飞行实践</title>
</head>

<body>
    <div>
        <blockquote style="font-family: 隶书;font-size:30px;">“问汝<b style="font-size:50px;font-family:华文行楷;color:crimson" id="ping">平</b>生功业，飞机巨鸡卖鸡”</blockquote>

    </div>
    <div id="dv">
        <div style="position:absolute;left:1000px;">
        <p style="font:30px;color:crimson">王牌飞行员榜</p>
            <table>
            <thead>
                <tr>
                    <th>座机名</th>
                    <th>分数</th>
                    <th>日期</th>
                </tr>
            </thead>
                <tbody id="rank"></tbody>
            </table>
        </div>
    </div>
    <script src='hunter.js'></script>
    <script>transferer.read_record();</script>
    <?php
    $name = "";
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $name = test_input($_POST["user_name"]);
    }
    function test_input($data)
    {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }
    ?>
    <form method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
        用户名：<input type="text" name="user_name" value="<?php echo $name; ?>" />
        <input type="submit" value="提交">
    </form>
    <?php
    if (!empty($name)) {
        echo <<<EOF
            <script>welcomePage();</script>
            <img class="Plane" onclick="window.location.href='VegetableHunter.php?ctrlmode=1&username=$name';" style="left:300px;"
            src="img/plane.png" />
            <img class="Plane" onclick="window.location.href='VegetableHunter.php?ctrlmode=2&username=$name';" style="left:700px"
            src="img/plane.png" />
            EOF;
    }
    ?>
</body>

</html>