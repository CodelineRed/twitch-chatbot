<?php
ini_set('display_errors', 'off');

function adminer_object() {
    // required to run any plugin
    include_once '../adminer/plugins/plugin.php';

    // autoloader
    foreach (glob('../adminer/plugins/*.php') as $filename) {
        include_once '../adminer/' . $filename;
    }

    $allowedIps = ['::1'];
    for ($i = 0; $i < 256; $i++) {
        $allowedIps[] = '172.' . $i . '.0.1';
        $allowedIps[] = '172.' . $i . '.0.2';
    }

    $plugins = array(
        new AdminerLoginIp($allowedIps, []),
    );

    /* It is possible to combine customization and plugins: */
    class AdminerCustomization extends AdminerPlugin {
        function name() {
            return 'Chatbot DB GUI';
        }

        function database() {
            return '../data/chatbot.sqlite3';
        }

        function credentials() {
                return array('127.0.0.1', '', '');
        }

        function css() {
            $return = array();
            $filename = "css/adminer.css";
            if (file_exists($filename)) {
                $return[] = $filename;
            }
            return $return;
        }

        function loginForm() {
            $drivers = ['sqlite' => 'Sqlite 3'];
            ?>
            <table cellspacing="0">
            <tr><th><?php echo lang('System'); ?><td><?php echo html_select('auth[driver]', $drivers, DRIVER) . "\n"; ?>
            <tr><th><?php echo lang('Server'); ?><td><input name="auth[server]" value="<?php echo $this->credentials()[0]; ?>" title="hostname[:port]" placeholder="localhost" autocapitalize="off">
            <tr><th style="display: none;"><?php echo lang('Username'); ?><td style="display: none;"><input name="auth[username]" id="username" value="<?php echo h($_GET['username']); ?>" autocapitalize="off" disabled="">
            <tr><th style="display: none;"><?php echo lang('Password'); ?><td style="display: none;"><input type="password" name="auth[password]" disabled="">
            <tr><th><?php echo lang('Database'); ?><td><input name="auth[db]" value="<?php echo $this->database(); ?>" autocapitalize="off">
            </table>
            <?php
            echo script("focus(qs('#username'));"); 
            echo "<p><input type='submit' value='" . lang('Login') . "'>\n";
            echo checkbox("auth[permanent]", 1, $_COOKIE["adminer_permanent"], lang('Permanent login')) . "\n";
        }
    }
    return new AdminerCustomization($plugins);
}

if (file_exists('../adminer/adminer-4.6.2.php')) {
    include '../adminer/adminer-4.6.2.php';
} else {
    echo 'Adminer 4.6.2 is missing.<br>';
    echo 'Install Adminer with Composer.<br>';
    echo 'See: <a href="https://github.com/CodelineRed/twitch-chatbot/#install-php-adminer-and-web-ui-optional" target="_blank">Install PHP, Adminer and Web UI</a>';
}
//phpinfo();