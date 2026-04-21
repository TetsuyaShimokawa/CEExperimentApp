function CE_task_GonzalezWuStyle

n_binary = 20;
n_ternary = 10;

%x_vals = [10:10:100];
x_vals = [100:100:800];
p_vals = [[0.02,0.05],[0.1:0.1:0.9],[0.95]];

% binary_trials の初期化（cell型で列数 = 8）
binary_trials = cell(n_binary, 8);

for i = 1:n_binary
    p = p_vals(randi(length(p_vals)));
    x = x_vals(randi(length(x_vals)));
    
    binary_trials(i,:) = { 'binary', p, x, 1-p, 0, NaN, NaN, NaN };  % '' ではなく NaN を使用
end

% ternary_trials の初期化
ternary_trials = cell(n_ternary, 8);

for i = 1:n_ternary
    %probs = rand(1,3);
    while(1)
        pb1 = p_vals(randi(length(p_vals)));
        pb2 = p_vals(randi(length(p_vals)));
        if(pb1+pb2<1)
            pb3=1-pb1-pb2;
            break
        end
    end
    probs=[pb1,pb2,pb3];
    %probs = probs / sum(probs);
    %probs = round(sort(probs, 'descend'), 2);

    x = sort(randsample([0, 0, 100, 200, 400, 800], 3));
    
    ternary_trials(i,:) = { 'ternary', probs(1), x(3), probs(2), x(2), probs(3), x(1), NaN };
end

% ヘッダーとデータを連結して Excel に出力
data = [binary_trials; ternary_trials];
headers = {'Type', 'p1', 'x1', 'p2', 'x2', 'p3', 'x3', 'CE'};
filename = 'CE_task_GonzalezWuStyle.xlsx';
writecell([headers; data], filename);