<!DOCTYPE html>
<html lang="zh-CN">
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

        .PlaneRight {
            transform: rotate(270deg);
        }
        .PlaneLeft{
            transform: rotate(90deg);
        }
    </style>
    <title>飞行实践</title>
</head>
<body>
    <div id="dv">
        <canvas id="ui" style="position: absolute;left: 0;right: 0;"></canvas>
        <div style="position: absolute; right: 100px; top: 100px;">
            <p>燃油储量</p>
            <meter id="mtro"></meter>
            <p>弹药储量</p>
            <meter id="mtrb"></meter>
            <p>你的巨</p>
            <p id="sc"></p>
            <p style="font:30px;color:crimson">王牌飞行员榜</p>
            <table style="font:5px;">
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
        <script src="hunter.js"></script>
        <script>gameMain();</script>
    </div>
</body>
</html>