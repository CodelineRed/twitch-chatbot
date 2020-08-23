<script>
    import LangSwitch from '../partial/langswitch';
    import Navigation from '../partial/navigation';

    export default {
        components: {
            'c-navigation': Navigation,
            'c-langswitch': LangSwitch
        }
    };
</script>

<template>
    <div>
        <header>
            <div class="container">
                <div class="form-row">
                    <c-langswitch ref="langswitch" drop="down"></c-langswitch>
                    <c-navigation ref="navigation"></c-navigation>
                </div>
            </div>
        </header>
        <main class="pt-3">
            <div class="container">
                <router-view ref="view" />
            </div>
        </main>
        <footer>
            <div class="container">
                <div class="row"></div>
            </div>
        </footer>
    </div>
</template>
