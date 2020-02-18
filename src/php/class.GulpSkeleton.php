<?php

class GulpSkeleton {
    
    private $cookiesAllowed;
    private $baseUrl;
    private $currentUrl;
    private $template;
    private $layout;
    private $locale;
    private $routeName;
    private $routes;
    private $cookieLocale;
            
    function __construct($defaultLocale, $routes) {
        $this->cookiesAllowed = isset($_COOKIE['cookieconsent_status']) && in_array($_COOKIE['cookieconsent_status'], array('allow', 'dismiss')) ? TRUE : FALSE;
        $this->baseUrl = ($_SERVER['SERVER_PORT'] == '80' ? 'http' : 'https') . '://' . $_SERVER['SERVER_NAME'] . str_replace('index.php', '', $_SERVER['PHP_SELF']);
        $this->currentUrl = ($_SERVER['SERVER_PORT'] == '80' ? 'http' : 'https') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        $this->cookieLocale = isset($_COOKIE['current_locale']) && in_array(isset($_COOKIE['current_locale']), ['de_de', 'en_us']) ? $_COOKIE['current_locale'] : $defaultLocale;
        $this->template = $routes['404-' . $this->cookieLocale]['template'];
        $this->layout = $routes['404-' . $this->cookieLocale]['layout'];
        $this->locale = $routes['404-' . $this->cookieLocale]['locale'];
        $this->routeName = '404';
        $this->routes = $routes;
    }
    
    public function getBaseUrl() {
        return $this->baseUrl;
    }
    
    public function getCookiesAllowed() {
        return $this->cookiesAllowed;
    }
    
    public function getCookieLocale() {
        return $this->cookieLocale;
    }
    
    public function getCurrentUrl() {
        return $this->currentUrl;
    }
    
    public function getLayout() {
        return $this->layout;
    }
    
    public function getLocale() {
        return $this->locale;
    }
    
    public function getTemplate() {
        return $this->template;
    }
    
    public function getRouteName() {
        return $this->routeName;
    }
    
    public function setBaseUrl($baseUrl) {
        $this->baseUrl = $baseUrl;
        
        return $this;
    }
    
    public function setCookiesAllowed($cookiesAllowed) {
        $this->cookiesAllowed = $cookiesAllowed;
        
        return $this;
    }
    
    public function setCookieLocale($cookieLocale) {
        $this->cookieLocale = $cookieLocale;
        
        return $this;
    }
    
    public function setCurrentUrl($currentUrl) {
        $this->currentUrl = $currentUrl;
        
        return $this;
    }
    
    public function setLayout($layout) {
        $this->layout = $layout;
        
        return $this;
    }
    
    public function setLocale($locale) {
        $this->locale = $locale;
        
        return $this;
    }
    
    public function setTemplate($template) {
        $this->template = $template;
        
        return $this;
    }
    
    public function setRouteName($routeName) {
        $this->routeName = substr($routeName, 0, strrpos($routeName, '-'));
        
        return $this;
    }
    
    /**
    * By default echos path for given route name.
    * 
    * Usage: <a href="<?php $gs->getPathFor('index'); ?>">Home</a>
    * 
    * @param string $routeName
    * @param string $locale optional (default: null)
    * @param string $baseUrl optional (default: null)
    * @param boolean $echo optional (default: true)
    * @param boolean $relative optional (default: true)
    */
    public function getPathFor($routeName, $locale = NULL, $baseUrl = NULL, $echo = TRUE, $relative = TRUE) {
        $locale = is_string($locale) ? $locale : $this->locale;
        $baseUrl = is_string($baseUrl) ? $baseUrl : $this->baseUrl;
        $uri = isset($this->routes[$routeName . '-' . $locale]) ? rtrim($baseUrl, '/') . $this->routes[$routeName . '-' . $locale]['path'] : '';
        
        if ($relative) {
            $uri = str_replace($baseUrl, '', $uri);
        }
        
        if ($echo) {
            echo $uri;
        } else {
            return $uri;
        }
    }
}
