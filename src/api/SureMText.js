import axios from 'axios';

export default axios.create({
    baseURL: "https://api.yelp.com/v3/businesses", //root URL you are going to make a request to
    headers: {
        Authorization: 
            'Bearer zO8n6ViH4HqJzKJzH8amzZon3-JjmYnDLELYuID6mcQmaqy-F0-VszavRz3Xmt2GvbRh2MwwqaleOYYUIKV___UKDBW5Pg1wQXrnBUeptrETbqiGbiSmxyQDOFoMYHYx'
    }
});