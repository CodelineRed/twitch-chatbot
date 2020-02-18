<?php
session_start();
error_reporting(E_ALL ^ E_NOTICE);
ini_set('display_errors', TRUE);
ini_set('display_startup_errors', TRUE);

// available routes
$routes = require __DIR__ . '/../src/php/routes.php';
require __DIR__ . '/../src/php/class.GulpSkeleton.php';
$gs = new GulpSkeleton('en_us', $routes);

http_response_code(404);
$lang = [];

// handle speaking url
$baseDir = str_replace('index.php', '', $_SERVER['PHP_SELF']);
$requestUri = str_replace($baseDir, '/', $_SERVER['REQUEST_URI']);

foreach ($routes as $routeName => $route) {
    // if requested path is available
    if ($requestUri === $route['path']) {
        http_response_code(isset($route['response-code']) ? $route['response-code'] : 200);
        $gs->setTemplate($route['template'])
            ->setLayout($route['layout'])
            ->setLocale($route['locale'])
            ->setRouteName($routeName);
        
        setcookie('current_locale', $gs->getLocale(), time()+60*60*24*365, '/');
        break;
    }
}

// if lang file is readable
if (is_readable(__DIR__ . '/../src/locale/' . $gs->getLocale() . '.php')) {
    $lang = require __DIR__ . '/../src/locale/' . $gs->getLocale() . '.php';
}

include __DIR__ . '/../templates/layouts/' . $gs->getLayout() . '.phtml';
