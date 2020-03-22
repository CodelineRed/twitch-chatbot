<script>
    import Footer from '../partial/footer';

    export default {
        components: {
            'c-footer': Footer
        }
    };
</script>

<template>
    <div>
        <main class="pt-3">
            <div class="container">
                <router-view ref="view" />
            </div>
        </main>
        <footer>
            <c-footer ref="footer" />
        </footer>
    </div>
</template>
