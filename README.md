## 后端设计

### 一、架构设计

#### 2.1 基础架构

- 数据库层——$MySQL$
- 模型层——$Module$
- 服务层——$Service$
- 控制层——$Controller$



#### 2.2 文件树

```
├── src/
│   ├── dbModels/
│   │   ├── usersModel.js            	# 用户表
│   │   ├── storesModel.js           	# 门店表
│   │   ├── dishCategoriesModel.js   	# 菜品分类表
│   │   ├── dishesModel.js           	# 菜品表
│   │   ├── storeDishStatusModel.js  	# 门店菜品状态表
│   │   ├── ordersModel.js           	# 订单表
│   │   ├── orderDetailsModel.js     	# 订单详情表
│   │   ├── adminsModel.js           	# 管理员模型
│   │   ├── carouselImagesModel.js   	# 轮播图表
│   │   ├── couponsModel.js          	# 优惠券表
│   │   └── couponRedemptionsModel.js 	# 优惠券兑换表
│   │
│   ├── services/
│   │   ├── usersService.js     	 	# 用户服务
│   │   ├── storesService.js     	 	# 门店服务
│   │   ├── ordersService.js       		# 订单服务
│   │   ├── dishesService.js        	# 菜品服务
│   │   ├── adminsService.js       		# 管理员服务
│   │   ├── carouselImagesService.js 	# 轮播图服务
│   │   ├── couponsService.js       	# 优惠券服务
│   │   └── payService.js         		# 微信付款服务
│   │
│   ├── controllers/
│   │   ├── usersController.js       	# 用户相关API
│   │   ├── storesController.js       	# 门店相关API
│   │   ├── ordersController.js       	# 订单相关API
│   │   ├── dishesController.js        	# 菜品相关API
│   │   ├── adminsController.js       	# 管理员相关API
│   │   ├── carouselImagesController.js # 轮播图相关API
│   │   ├── couponsController.js       	# 优惠券相关API
│   │   └── payController.js         	# 微信支付接口与API
│   │
│   ├── middleware/                  	# 存放中间件
│   ├── utils/                       	# 工具类
│   ├── config/                  	
│   │   ├── dbConfig.js
│   │   └── otherConfig.js            	# 其他配置
│   │
│   └── app.js                       	
│
└──    	
```





### 二、数据库创建

#### 用户表

```sql

```

#### 门店表

```sql

```

#### 菜品分类表

```sql

```

#### 菜品表

```sql

```

#### 各店菜品状态表

```sql

```

#### 订单表

```sql

```

#### 订单详情表

```sql

```

#### 管理员表

```sql

```

#### 轮播图表

```sql

```

#### 优惠券表

```sql

```

#### 优惠券兑换表

```sql

```





### 三、项目配置

#### 3.1 数据库配置

> 将密码和敏感信息直接硬编码在源代码中存在安全问题，特别是当代码库可能被存储在版本控制系统（如Git）或与其他开发人员共享时。为了提高安全性，建议使用环境变量来管理这些敏感信息。环境变量可以在运行时提供给应用程序，而不需要将它们直接存储在代码库中。

1. **安装dotenv**：首先，安装`dotenv`包，它允许从一个文件加载环境变量，而这个文件不会被加入到版本控制中。

   ```bash
   npm install dotenv
   ```

2. **创建.env文件**：在项目的根目录下创建一个`.env`文件，并添加数据库配置信息。

   ```
   DB_NAME=your_database_name
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_HOST=your_database_host
   ```

   确保`.env`文件被添加到`.gitignore`文件中，以避免将其推送到版本控制系统。

3. **修改`dbConfig.js`以使用环境变量**：修改`dbConfig.js`文件，以使用`dotenv`加载`.env`文件中的环境变量。

   ```javascript
   require('dotenv').config(); // 顶部添加这行代码来加载.env文件
   
   const { Sequelize } = require('sequelize');
   
   // 使用环境变量代替硬编码的值
   const database = process.env.DB_NAME;
   const username = process.env.DB_USER;
   const password = process.env.DB_PASSWORD;
   const host = process.env.DB_HOST;
   const dialect = 'mysql';
   
   const sequelize = new Sequelize(database, username, password, {
       timezone: '+08:00',
       host: host,
       dialect: dialect,
       pool: {
           max: 5,
           min: 0,
           acquire: 30000,
           idle: 10000
       },
       define: {
           freezeTableName: true
       }
   });
   
   sequelize.authenticate()
       .then(() => {
           console.log('Connection has been established successfully.');
       })
       .catch(err => {
           console.error('Unable to connect to the database:', err);
    });
   
   module.exports = sequelize;
   ```

使用环境变量的方法不仅提高了安全性，还提供了更大的灵活性，因为您可以轻松地更改环境变量而无需修改代码。此外，这也便于在不同环境（如开发、测试和生产）之间迁移和部署应用程序。



#### 3.2 Nginx反代理配置

> ##### 反向代理（Reverse Proxy）
>
> - **作用对象**：反向代理位于服务器端，客户端通常不知道后端服务器的存在。它代表服务器（或服务器集群）接收来自客户端的请求，然后将请求转发到内部网络上的一个或多个服务器上。
> - **主要用途**：反向代理用于负载均衡、提供缓存、SSL终端、提供安全保护等。它还可以用于将请求分发到指向不同服务的不同内部服务器，如你的Nginx配置所做的那样。
> - **客户端透明性**：对于客户端来说，它们感觉就像是直接与反向代理通信，而不是后端的真实服务器。
> - **示例**：Nginx、Apache HTTP Server（配置为反向代理）、HAProxy。
>
> ##### 正向代理（Forward Proxy）
>
> - **作用对象**：正向代理位于客户端和服务器之间，主要代理客户端，帮助客户端请求内容。客户端必须要进行特定配置（如在浏览器中设置代理服务器），以通过代理服务器访问外部资源。
> - **主要用途**：正向代理用于绕过访问限制（如防火墙或地理限制）、提供缓存服务以减少带宽使用、监控和过滤用户请求等。
> - **服务器透明性**：对于服务器来说，它们感觉就像是直接与正向代理通信，而不是真正的客户端。
> - **示例**：Squid、Privoxy。
>
> ##### 区别
>
> - **代理对象不同**：正向代理代理的是客户端，反向代理代理的是服务器。
> - **使用目的不同**：正向代理主要用于帮助客户端访问受限制的资源，而反向代理主要用于负载均衡、安全保护、缓存等，以提高后端服务的可用性和性能。
> - **配置位置不同**：正向代理需要在客户端进行配置，而反向代理的配置在服务器端。
> - **透明性**：正向代理对服务器透明，反向代理对客户端透明。



- ##### 配置文件位置

  ```
  /www/server/nginx/conf/nginx.conf
  ```

- ##### 配置SSL证书（HTTPS）

  ```conf
  server {
  	listen 80 ;
      server_name forestlamb.online www.forestlamb.online;  # 或使用 localhost
      return 301 https://$server_name$request_uri;
  }
  
  server {
  	listen 443 ssl;
  	server_name forestlamb.online www.forestlamb.online;  # 或使用 localhost
  	
  	root /home/www/forestlamb;  # 指向网站的根目录
  	index index.html index.htm index.php;
  
      ssl_certificate cert/forestlamb.online.pem; # 证书的文件名。
  	ssl_certificate_key cert/forestlamb.online.key; # 证书的密钥文件名。
  	ssl_session_timeout 5m;
  	ssl_ciphers
  	ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4; 
  	ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # 使用该协议进行配置。
  	ssl_prefer_server_ciphers on;
  
  	……
  }
  ```

- ##### 配置反向代理

  ```conf
  # 1.静态资源配置
  location /public/ {
      alias /home/www/public/;
  }
  
  # 2.访问nodejs项目（唐合丰拌面馆）
  location /restaurant {
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
  }
  
  # 3.处理静态文件和前端资源（网站）
  location / {
      root /home/www/forestlamb;  # 指定默认页面的根目录
      index index.html;  # 指定默认页面的文件名
      try_files $uri $uri/ /index.html;  # 优先尝试查找静态文件，否则返回默认页面
  }
  
  # 4.处理隐藏文件
  location ~ /\.(?!well-known) {
  	deny all;
  }
  ```

- ##### 测试Nginx配置文件

  在应用新的配置之前，非常重要的一步是验证配置文件的语法正确性。这可以通过Nginx的命令行工具来完成。在命令行中，运行以下命令：

  ```
  nginx -t
  ```

  这个命令会检查Nginx的主配置文件及其包含的所有其他配置文件的语法是否正确。如果一切正常，它将输出类似以下的消息：

  ```
  nginx: configuration file /etc/nginx/nginx.conf test is successful
  ```

  如果有错误，Nginx将指出错误所在的文件和行号，你需要根据提供的错误信息修正配置文件中的问题。

- ##### 重新加载Nginx配置

  一旦确认配置文件没有语法错误，下一步是让这些更改生效。你不需要重启Nginx服务（这会导致短暂的服务中断），而是可以要求Nginx平滑地重新加载配置。使用以下命令来重新加载配置：

  ```
  sudo nginx -s reload
  ```

  这条命令会让Nginx关闭旧的工作进程并启动新的进程，使用新的配置，从而避免了服务的中断。



#### 3.3 项目运行

- ##### 运行 Node.js 程序：

  1. 打开终端。

  2. 打开到包含 Node.js 程序文件的目录。

     ```
     cd /home/www/restaurant/
     ```

  3. 运行 Node.js 主程序。

     ```
     node app.js &
     ```

- ##### 查看 Node.js 进程：

  1. 要查看当前正在运行的 Node.js 进程，可以使用 `ps` 命令和 `grep` 进行过滤。例如，要查看所有名为 `node` 的进程，可以运行：

     ```
     ps aux | grep node
     ```

     这将列出与 Node.js 相关的所有进程信息。

  2. 还可以使用 `pgrep` 命令来查找 Node.js 进程的 PID（进程ID）。例如：

     ```
     pgrep node
     ```

     

- ##### **关闭 Node.js 进程：**

  使用 `kill` 命令关闭 Node.js 进程，其中包括进程的 PID

  ```
  kill 12345
  ```

  这将终止具有给定 PID 的进程。

  

- ##### 持续运行

  如果你已经在服务器上运行了 Node.js 项目，并且希望让它在后台持续运行，你可以使用一些工具来实现这一点，比如 `pm2` 或 `forever`。这些工具可以确保你的 Node.js 应用在服务器上持续运行，并且可以在后台管理和监控它们的状态。

  下面是如何使用 `pm2` 来启动和管理 Node.js 项目的简要步骤：

  1. 首先，确保你已经通过 SSH 登录到服务器上，并进入到你的 Node.js 项目所在的目录。

  2. 安装 `pm2`，你可以使用以下命令安装它：

     ```
     npm install pm2 -g
     ```

  3. 启动 Node.js 项目，并让它在后台持续运行：

     ```
     pm2 start your_app.js
     ```

     这里的 `your_app.js` 是你的 Node.js 主文件，替换成你实际的文件名。

  4. 如果需要，你可以使用 `pm2 list` 命令来查看正在运行的应用程序列表，以及它们的状态。

  5. 如果需要停止应用程序，可以使用以下命令：

     ```
     pm2 stop <app_name_or_id>
     ```

     这里的 `<app_name_or_id>` 是你的应用程序名称或者 ID。

  6. 如果你想要让你的应用程序在系统启动时自动启动，可以使用以下命令：

     ```
     pm2 startup
     ```

     这会为你生成一个启动脚本，并且注册为系统服务，以确保你的应用程序在系统重启后自动启动。

  7. 最后，你可以使用 `pm2 logs` 命令来查看应用程序的日志。

  通过使用 `pm2`，你可以方便地管理你的 Node.js 应用程序，并确保它们在服务器上持续运行。





#### 3.4 Redis配置

##### 步骤 1: 添加 EPEL 仓库

EPEL (Extra Packages for Enterprise Linux) 仓库包含了许多在标准 CentOS 仓库中不可用的额外软件包。由于 Redis 可能不在 CentOS 的默认仓库中，所以需要添加 EPEL 仓库。可以使用以下命令来添加：

```bash
sudo yum install epel-release
```

##### 步骤 2: 安装 Redis

添加了 EPEL 仓库后，就可以使用 `yum` 命令安装 Redis 了：

```bash
sudo yum install redis
```

##### 步骤 3: 启动 Redis 服务

使用以下命令来启动 Redis 服务：

```bash
sudo systemctl start redis
```

##### 步骤 4: 验证 Redis 是否正在运行

使用以下命令来测试 Redis 服务器是否启动成功：

```bash
redis-cli ping
```

如果 Redis 正在运行，你将看到返回的消息是 `PONG`。

##### 步骤 5: 设置 Redis 开机自启

如果你希望 Redis 在服务器重启后自动启动，可以使用以下命令来设置 Redis 服务的开机自启：

```bash
sudo systemctl enable redis
```

##### 可选步骤: 配置 Redis 安全设置

默认情况下，Redis 是不安全的，因为它允许无密码访问。你可能希望进行一些安全配置，比如设置密码。可以通过编辑 Redis 配置文件 `/etc/redis.conf` 来实现。找到 `# requirepass foobared` 这一行，取消注释，并将 `foobared` 替换为你想要的密码。之后，重启 Redis 服务以应用更改：

```bash
sudo systemctl restart redis
```

这些步骤将在 CentOS 7 系统上安装和配置 Redis 服务。这样，你就可以开始在你的 Node.js 应用中使用 Redis，例如作为 Bull 队列的后端存储。





### 四、详细设计

#### 4.1 用户

- ##### 模型层代码

- ##### 服务层代码

- ##### 控制层代码



#### 4.2 门店

- ##### 模型层代码

- ##### 服务层代码

- ##### 控制层代码



#### 4.3 菜品

- ##### 模型层代码

- ##### 服务层代码

- ##### 控制层代码

- **测试**

  1. 新增菜品

     ```
     POST https://forestlamb.online/restaurant/dishes/
     ```

     ```json
     {
       "dish_name": "招牌牛肉拌面",
       "price": 19.99,
       "category_id": 1, 
       "icon": "path/to/icon.jpg",
       "keywords": "牛肉，圆面条",
       "flavor_description": "经典川菜，麻辣鲜香，肉质鲜嫩。",
       "mandatory_options": [
         {
           "name": "种类",
           "options": ["面", "粉"]
         },
         {
           "name": "辣度",
           "options": ["微辣", "不辣", "加辣"]
         },
         {
           "name": "麻度",
           "options": ["微麻", "不麻", "不麻"]
         },
         {
           "name": "量",
           "options": ["标准", "加量"]
         }
       ],
       "optional_options": ["葱花", "香菜", "豆豆"]
     }
     ```

  2. 查询菜品

     ```
     GET https://forestlamb.online/restaurant/dishes/
     ```

     

#### 4.4 订单

- ##### 模型层代码

  ```js
  
  ```

  ```js
  
  ```

- ##### 服务层代码

  需求：

  1. 用户 根据用户id+订单状态查询订单+订单详情
  2. 后厨 根据订单状态查询所有用户订单+订单详情
  3. 用户+后厨 修改订单状态
  4. 用户 创建订单+订单详情

- ##### 控制层代码

- **测试**

  1. 创建订单

     ```
     https://59.110.229.153/restaurant/orders/create
     ```

     ```json
     {
       "orderData": {
         "store_id": 1,
         "user_id": 1,
         "order_type": "外卖",
         "order_time": "2024-02-21T12:00:00.000Z",
         "order_status": "待支付",
         "total_price": 100.00,
         "payment_method": "微信支付",
         "note": "请快点送达",
         "address": "用户地址",
         "call_name": "张三",
         "phone": "12345678901"
       },
       "orderDetails": [
         {
           "dish_id": 3,
           "order_type": "打包",
           "mandatory_options": "{\"size\": \"大份\"}",
           "optional_options": "{\"extra_sauce\": \"多放酱\"}",
           "quantity": 2,
           "price": 50.00
         },
         {
           "dish_id": 3,
           "order_type": "打包",
           "mandatory_options": "{\"size\": \"大份\"}",
           "optional_options": "{\"extra_sauce\": \"多放酱\"}",
           "quantity": 2,
           "price": 50.00,
           "note":"放在牛肉拌面里"
         }
       ]
     }
     ```

  2. 用户查询订单





#### 4.5 管理员

- ##### 模型层代码

- ##### 服务层代码

- ##### 控制层代码

- ##### 测试

  1. 注册

     ```
     POST https://forestlamb.online/restaurant/admins/register
     ```

     ```
     {
         "admin_account": "zhangsan",
         "admin_password": "123456",
         "store_id": "1",
         "role": "店长"
     }
     ```

  2. 登录

     ```
     POST https://forestlamb.online/restaurant/admins/login
     ```

     ```
     {
         "admin_account": "zhangsan",
         "admin_password": "123456",
     }
     ```






#### 4.6 优惠券

- ##### 模型层代码

- ##### 服务层代码

- ##### 控制层代码



#### 4.7 其他

- ##### 微信支付

- ##### 微信退款

- ##### app.js







### 五、微信支付

#### 5.1 支付流程

1. 客户端触发支付按钮，服务器接收到支付请求 
2. 服务器先根据订单信息向微信支付服务器发起请求获取prepay_id 
3. 服务器根据获取到的prepay_id构建客户端签名 
4. 将构建好签名返回客户端 
5. 客户端接收到签名向微信支付服务器发起支付，客户端流程结束 
6. 微信支付服务器根据客户端的请求向服务器异步发起回调，服务器根据回调继续处理

> 1. **客户端触发支付**：用户在客户端（如微信小程序、公众号等）点击支付按钮，向你的服务器发送支付请求。
>
> 2. **服务器获取`prepay_id`**：你的服务器根据客户端发送的订单信息，向微信支付服务器发起请求，获取预支付交易会话标识（`prepay_id`）。这一步需要服务器生成签名并附加在请求中，以证明请求的合法性。
>
> 3. **服务器构建客户端签名**：服务器使用获取到的`prepay_id`，再次生成一个签名（客户端签名），这次签名是用于客户端调起微信支付界面所必需的。
>
> 4. **返回签名给客户端**：服务器将构建好的客户端签名及其他必要信息返回给客户端。
>
> 5. **客户端发起支付请求**：客户端接收到服务器返回的签名和支付信息后，调起微信支付界面，用户完成支付操作。这一步骤完全在客户端和微信支付服务器之间进行，与你的服务器无关。
>
> 6. **微信支付回调服务器**：支付完成后，微信支付服务器会根据之前提供的通知URL，向你的服务器发送支付结果的异步回调。你的服务器需要验证这些回调信息的真实性和完整性，然后根据支付结果（成功、失败等）进行相应的业务处理，比如更新订单状态、记录交易信息等。
