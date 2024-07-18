module.exports = {
    content: ['./**/*.html'],
    theme: {
        extend: {},
    },
    daisyui: {
        themes: [
        {
            mytheme: {
                "neutral": "#5B574C",
                "base-100": "#D9D9D9",
                "accent": "#48453C",
        },
        },
        ],
    },
    plugins: [require('daisyui')],
};
