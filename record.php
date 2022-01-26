<?php
if (isset($_POST['action'])) {
    $servername = 'localhost';
    $dbusername = 'root';
    $passwd = "fakeping";
    $dbname = "plane";
    $conn = new mysqli($servername, $dbusername, $passwd, $dbname);
    if ($conn->connect_errno) {
        die("connect error: " . $conn->connect_error);
    }

    $action = $_POST['action'];
    if ($action == 'write' && isset($_POST['score']) && isset($_POST['username'])) {
        $username = $_POST['username'];
        $score = (double)$_POST['score'];
        $sql = "SELECT * FROM user WHERE plane_name='$username'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                if ($row['plane_score'] < $score) {
                    $updatesql = "UPDATE user SET plane_score=$score,record_date=NOW() WHERE plane_name='$username'";
                    if($conn->query($updatesql)){
                        echo "Successfully Updated";
                    }
                    else{
                        echo "Fail to Update";
                    }
                }
                else{
                    echo "Lower Than Record";
                }
            }
        } else {
            $insertsql = "INSERT INTO user (plane_name,plane_score,record_date) VALUES('$username',$score,NOW())";
            if($conn->query($insertsql)){
                echo "Successfully Added";
            }
            else{
                echo "Fail to Add";
            }
        }
    } elseif ($action == 'write' && (!isset($_POST['score'])) && (!isset($_POST['username']))) {
        echo 'Fail to fetch name and score!';
    } elseif ($action == 'read') {
        $i = 0;
        $list = array();
        $tmp = array();
        $readsql = "SELECT * FROM user ORDER BY plane_score DESC";
        $readresult = $conn->query($readsql);
        if ($readresult->num_rows > 0) {
            while ($row = $readresult->fetch_assoc()) {
                $tmp["name"] = $row['plane_name'];
                $tmp["score"] = $row['plane_score'];
                $tmp["date"] = $row['record_date'];
                $list[$i++] = $tmp;
            }
        }
        echo json_encode($list);
    }

    $conn->close();
} else {
    echo "URL Error!";
}
