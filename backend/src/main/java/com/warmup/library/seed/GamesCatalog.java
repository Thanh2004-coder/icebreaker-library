package com.warmup.library.seed;

import java.util.List;

public final class GamesCatalog {

    private GamesCatalog() {
    }

    public static final String COMMON_RULES = """
            Quy định chung:
            • Không ai được bỏ qua lượt. Nếu đang ngại, trả lời ngắn (một từ, một cử chỉ, hoặc “cho mình 5 giây”).
            • Không tạo áp lực cạnh tranh quá mạnh. Không tính điểm trừ, không xếp hạng thua.
            • Không đánh giá hoặc chê câu trả lời.
            • Ưu tiên câu hỏi dễ, đời thường, phù hợp nhóm mới làm quen.
            • Trò không có hoạt động tay chân thì không dành 5 phút chuẩn bị trước.
            • Trò cần tài liệu/hình ảnh (Bingo, Nhìn hình đoán chữ): Leader chuẩn bị nội dung trước khi bắt đầu.
            • Trò có hoạt động tay chân: cho mọi người vài phút đứng dậy / tìm đồ trước khi chơi.
            • Chỉ chơi trực tiếp trong cùng một không gian.""";

    public static List<GameSeed> all() {
        return List.of(
                game(
                        "Truyền tin nhắn",
                        "Chinese Whisper bằng lời: thì thầm một câu ngắn lần lượt trong nhóm, rồi so câu cuối với câu gốc.",
                        """
                                1. Cả nhóm đứng hoặc ngồi thành vòng trong lớp.
                                2. Leader nghĩ một câu ngắn, dễ hiểu rồi thì thầm vào tai người bên cạnh.
                                3. Lần lượt thì thầm đến người cuối. Người cuối nói to câu nhận được.
                                4. Leader đọc câu gốc. Cả nhóm cười với chỗ “lạc” — không ai bị phạt.""",
                        8, 5, false, 0,
                        "Không cần chuẩn bị thân thể. Leader chỉ cần nghĩ sẵn 1 câu trung tính.",
                        "Chỉ dùng câu trung tính. Nói rõ, không cố tình phá nếu nhóm còn rụt rè.",
                        "classroom",
                        List.of("icebreak", "laugh", "interact", "kickoff")
                ),
                game(
                        "Đi tìm báu vật trong nhà",
                        "Mini Scavenger Hunt: mỗi người tìm nhanh một món đồ theo gợi ý rồi khoe với nhóm trong phòng.",
                        """
                                1. Leader đọc lần lượt 4–5 gợi ý dễ: “một vật màu xanh”, “thứ làm bạn tỉnh táo”, “một món dùng lúc học”.
                                2. Mỗi gợi ý: mọi người có 20–30 giây tìm đồ trong phòng / quanh chỗ ngồi.
                                3. Lần lượt đưa đồ ra giữa nhóm và nói đúng một câu.
                                4. Không ai bị loại. Ai chưa tìm thấy có thể mô tả món đồ.
                                5. Leader chọn 1 món “đáng nhớ nhất” để cả nhóm vỗ tay, không chấm điểm.""",
                        18, 5, true, 3,
                        "Có hoạt động tay chân: cho 2–3 phút dọn góc ngồi. Leader soạn sẵn list gợi ý trước.",
                        "Nhịp chậm. Không biến thành cuộc đua.",
                        "indoor",
                        List.of("icebreak", "interact", "comfort", "kickoff")
                ),
                game(
                        "Đứng lên - Ngồi xuống theo lệnh ngược",
                        "Leader ra lệnh, cả nhóm làm NGƯỢC: nghe “đứng” thì ngồi, nghe “ngồi” thì đứng.",
                        """
                                1. Cả nhóm đứng tại chỗ trong lớp, chừa khoảng để ngồi xuống an toàn.
                                2. Leader nói chậm: “Đứng lên” hoặc “Ngồi xuống”. Cả nhóm làm NGƯỢC lệnh.
                                3. Sai thì cười và chơi tiếp, không bị loại.
                                4. Kết thúc bằng một lệnh thật để cả nhóm ngồi lại.""",
                        5, 10, true, 2,
                        "Có hoạt động tay chân: dành 1–2 phút đứng dậy. Không chơi nếu ai đang không tiện đứng.",
                        "Nhịp chậm, không loại người.",
                        "classroom",
                        List.of("icebreak", "laugh", "interact", "kickoff")
                ),
                game(
                        "Câu chuyện 3 chương",
                        "Ba người nối một câu chuyện rất ngắn: mở đầu, tình huống, kết. Người còn lại thêm chi tiết nhỏ.",
                        """
                                1. Nhóm ngồi thành vòng nhỏ. Leader đưa chủ đề nhẹ: “một buổi học bị mất điện”.
                                2. Người 1 nói 2–3 câu mở đầu. Người 2 thêm tình huống. Người 3 kết thúc.
                                3. Người còn lại thêm đúng 1 câu chi tiết nhỏ.
                                4. Không cần hay. Chỉ cần nối được mạch.""",
                        10, 4, false, 0,
                        "Không có hoạt động tay chân — không dành 5 phút chuẩn bị thân thể.",
                        "Không bắt bịa dài. Không chê ý tưởng.",
                        "small-group",
                        List.of("icebreak", "laugh", "interact", "communicate", "kickoff")
                ),
                game(
                        "Đặt biệt danh vui",
                        "Mỗi người chọn một biệt danh dễ gọi trong buổi họp mặt, giải thích bằng một câu.",
                        """
                                1. Leader nêu ví dụ trước: “Hôm nay mình là Trà Đá, vì mình tỉnh táo chậm”.
                                2. Lần lượt mỗi người nói: tên thật + biệt danh + lý do một câu.
                                3. Biệt danh phải dễ nói, không đụng chạm ngoại hình / điểm yếu.
                                4. Leader ghi nhanh lên bảng để mọi người nhớ.""",
                        7, 5, false, 0,
                        "Không cần chuẩn bị trước. Ai không muốn biệt danh có thể dùng tên + một cử chỉ.",
                        "Cấm biệt danh chế giễu.",
                        "classroom",
                        List.of("meet", "icebreak", "laugh", "comfort", "kickoff")
                ),
                game(
                        "Tìm điểm chung nhanh",
                        "Cả nhóm tìm càng nhiều điểm chung càng tốt trong thời gian ngắn, không cần sâu.",
                        """
                                1. Leader đặt câu dễ: “Ai từng thức khuya làm bài giơ tay”.
                                2. Những người giơ tay nói thêm 1 chi tiết rất ngắn.
                                3. Lặp 4–5 câu: đồ uống, môn học, thú cưng, ca sĩ nghe dạo này.
                                4. Leader ghi 3 điểm chung lên bảng rồi cả nhóm bắt tay.""",
                        8, 5, false, 0,
                        "Không cần chuẩn bị thân thể. Leader chỉ cần 4–5 câu hỏi đóng (có/không) soạn sẵn.",
                        "Không hỏi thu nhập, điểm số, chuyện gia đình nhạy cảm.",
                        "small-group",
                        List.of("meet", "icebreak", "common", "comfort", "kickoff")
                ),
                game(
                        "Đoán chủ nhân",
                        "Mỗi người chọn một món đồ. Cả nhóm đoán món đó của ai, rồi chủ nhân nói một câu.",
                        """
                                1. Mỗi người chọn một món gần tầm tay, đặt úp hoặc giấu tên.
                                2. Lần lượt giơ đồ lên, chưa nói tên chủ nhân.
                                3. Cả nhóm đoán chủ nhân. Chủ nhân xác nhận và nói 1 câu về món đồ.
                                4. Không cần đoán đúng hết.""",
                        10, 5, true, 2,
                        "Cho 1–2 phút chọn đồ trong lớp. Không dùng đồ mang tính riêng tư quá.",
                        "Không tạo áp lực phải đoán đúng.",
                        "classroom",
                        List.of("meet", "icebreak", "laugh", "communicate")
                ),
                game(
                        "Bingo làm quen",
                        "Mỗi ô bingo là một câu dễ. Tìm người trong lớp khớp và đánh dấu.",
                        """
                                1. Leader phát bảng bingo 3x3 hoặc 4x4 đã in sẵn.
                                2. Mỗi ô là một đặc điểm nhẹ: “hay nghe podcast”, “nấu được một món”, “thích mèo”.
                                3. Đi quanh lớp, hỏi nhau. Ai khớp ký tên vào ô và kể đúng 1 câu.
                                4. Ai có 1 hàng thì hô “Bingo” — cả nhóm vỗ tay, không tặng phạt.""",
                        15, 12, true, 10,
                        "Leader phải chuẩn bị bảng bingo trước khi bắt đầu. Không thêm 5 phút khởi động thân thể.",
                        "Ô phải dễ, phù hợp nhóm mới.",
                        "classroom",
                        List.of("meet", "icebreak", "interact", "common", "kickoff")
                ),
                game(
                        "Từ nối từ",
                        "Người trước nói một từ, người sau nói từ liên quan. Giữ nhịp chậm, không loại.",
                        """
                                1. Hai người ngồi đối diện. Leader (hoặc một người) mở từ: “Nhóm”.
                                2. Người kia nói một từ liên quan: “họp”, “bài tập”, “lớp”…
                                3. Đi vài vòng. Nếu kẹt, được hỏi gợi ý: “nghĩ về đồ ăn / môn học”.
                                4. Kết bằng từ cuối cùng nói đồng thanh.""",
                        6, 2, false, 0,
                        "Không cần chuẩn bị trước. Có thể bắt đầu ngay.",
                        "Không tính giờ gấp. Im lặng 5 giây vẫn được.",
                        "indoor",
                        List.of("icebreak", "interact", "communicate", "kickoff")
                ),
                game(
                        "Nhìn hình đoán chữ",
                        "Leader chiếu hoặc giơ hình; nhóm đoán từ/cụm từ. Ưu tiên hình vui, không đánh đố.",
                        """
                                1. Leader chuẩn bị 6–8 hình in sẵn hoặc viết trên bảng.
                                2. Giơ từng hình 20–30 giây.
                                3. Mọi người đoán nói to, không giành lời.
                                4. Leader chốt đáp án rồi sang hình tiếp. Dừng khi hết giờ.""",
                        10, 5, true, 10,
                        "Leader phải chuẩn bị hình trước. Tránh hình phản cảm hoặc quá khó.",
                        "Không xếp hạng ai đoán nhanh nhất.",
                        "classroom",
                        List.of("icebreak", "laugh", "interact", "kickoff")
                ),
                game(
                        "Giới thiệu bằng 3 từ",
                        "Mỗi người mô tả mình tuần này bằng đúng 3 từ, rồi giải thích 10 giây nếu muốn.",
                        """
                                1. Leader làm mẫu: “Deadline – trà đá – mưa”.
                                2. Mỗi người nói 3 từ. Có thể viết ra giấy rồi đọc.
                                3. Không bắt kể dài. Ai ngại chỉ cần 3 từ, không giải thích.
                                4. Leader gom điểm chung của cả nhóm.""",
                        5, 5, false, 0,
                        "Cho 20 giây nghĩ trước khi bắt đầu vòng nói.",
                        "Câu trả lời ba từ là đủ.",
                        "small-group",
                        List.of("meet", "icebreak", "comfort", "communicate", "kickoff")
                ),
                game(
                        "This or That",
                        "Chọn nhanh một trong hai thứ dễ: trà/cà phê, sáng/tối, mèo/chó… Không có đáp án đúng.",
                        """
                                1. Leader đọc cặp: “Trà sữa hay nước lọc?”
                                2. Mọi người giơ 1 ngón / 2 ngón, hoặc bước sang trái/phải trong lớp.
                                3. Leader hỏi 1–2 người vì sao — trả lời một câu.
                                4. Lặp 5–6 cặp đời thường, không chính trị, không ngoại hình.""",
                        7, 8, false, 0,
                        "Không cần chuẩn bị thân thể. Leader soạn sẵn 5–6 cặp lựa chọn dễ.",
                        "Không tranh luận ai đúng.",
                        "classroom",
                        List.of("icebreak", "laugh", "interact", "comfort", "kickoff")
                ),
                game(
                        "Emoji tâm trạng",
                        "Mỗi người chọn 1–2 biểu cảm hoặc sticker giấy để mô tả cảm xúc lúc bắt đầu buổi họp mặt.",
                        """
                                1. Leader phát giấy nhỏ / sticky note. Mọi người vẽ một mặt cười hoặc viết 1 từ cảm xúc.
                                2. Lần lượt giơ giấy lên. Muốn nói thêm một câu thì nói, không bắt buộc.
                                3. Leader gom cảm xúc nhóm rồi chuyển sang việc chính, không phán xét.""",
                        4, 5, false, 0,
                        "Không có hoạt động tay chân nặng — không thêm 5 phút chuẩn bị. Có thể dùng giấy sẵn trong phòng.",
                        "Không hỏi “vì sao buồn”.",
                        "indoor",
                        List.of("icebreak", "comfort", "communicate", "kickoff")
                ),
                game(
                        "Show and Tell 30 giây",
                        "Khoe một vật trong tầm tay và nói tối đa 30 giây vì sao hôm nay để nó gần mình.",
                        """
                                1. Cho 1 phút tìm vật (ly, tai nghe, vở, móc khóa).
                                2. Mỗi người: giơ vật + nói tối đa 30 giây.
                                3. Nhóm vỗ tay nhẹ. Không so sánh vật “cool” hơn.""",
                        8, 5, true, 1,
                        "Có thao tác cầm đồ: cho 1 phút tìm vật trong phòng.",
                        "Leader canh giờ nhẹ, không cắt lời đột ngột.",
                        "indoor",
                        List.of("meet", "icebreak", "interact", "comfort")
                ),
                game(
                        "Would You Rather nhẹ",
                        "Chọn một trong hai tình huống vô hại, giải thích đúng một câu. Chơi khi đang đi hoặc đứng trên campus.",
                        """
                                1. Leader đọc: “Thức khuya làm bài hay dậy sớm làm bài?”
                                2. Giơ tay hoặc bước sang hai phía.
                                3. 1–2 người giải thích một câu.
                                4. Lặp 4–5 câu. Câu cuối liên quan việc nhóm sắp làm.""",
                        7, 5, false, 0,
                        "Không cần chuẩn bị trước. Cấm tình huống sợ hãi, ngoại hình, tiền bạc.",
                        "Không có đáp án thắng.",
                        "campus",
                        List.of("icebreak", "laugh", "interact", "kickoff")
                ),
                game(
                        "Câu chuyện nối câu",
                        "Mỗi người thêm đúng một câu vào câu chuyện chung, đi một vòng.",
                        """
                                1. Leader mở: “Sáng nay một nhóm sinh viên vào lớp và thấy…”
                                2. Mỗi người thêm 1 câu. Đi hết vòng, có thể vòng 2 nếu còn giờ.
                                3. Ai kẹt được gợi ý: “thêm một chi tiết đồ vật / thời tiết”.
                                4. Người cuối kết thúc có hậu.""",
                        8, 5, false, 0,
                        "Không cần chuẩn bị thân thể. Nếu ngại, nói một câu rất ngắn như “rồi mất điện”.",
                        "Không được bỏ lượt.",
                        "small-group",
                        List.of("icebreak", "laugh", "interact", "communicate", "kickoff")
                ),
                game(
                        "High-five ảo theo chủ đề",
                        "Leader nêu chủ đề, ai khớp thì high-five người bên cạnh. Rất nhanh, rất ít nói.",
                        """
                                1. Cả nhóm đứng thành vòng trong lớp.
                                2. “High-five nếu hôm nay uống cà phê.” Ai khớp high-five người cạnh mình.
                                3. Đổi chủ đề: ngủ muộn, thích mèo, đang mang balo.
                                4. Làm 6–8 chủ đề. Chủ đề cuối: “High-five nếu sẵn sàng vào việc”.""",
                        4, 10, false, 0,
                        "Phù hợp nhóm rụt rè vì gần như không phải nói. Không cần 5 phút chuẩn bị.",
                        "Không bắt kể thêm. Chỉ chơi trực tiếp trong lớp.",
                        "classroom",
                        List.of("icebreak", "interact", "comfort", "kickoff")
                ),
                game(
                        "Câu hỏi 3 giây",
                        "Leader hỏi câu siêu dễ, mỗi người trả lời đúng một từ trong khoảng 3–5 giây.",
                        """
                                1. Câu mẫu: “Đồ uống lúc này?”, “Môn đang tới hạn?”.
                                2. Đi vòng quanh lớp. Không giải thích.
                                3. 2–3 vòng câu khác nhau.
                                4. Ai chưa nghĩ ra nói “nước lọc” / “chưa nghĩ” — vẫn tính là đã tham gia.""",
                        5, 5, false, 0,
                        "Không cần chuẩn bị trước. Câu phải trả lời được bằng một từ.",
                        "Không biến thành thẩm vấn. Leader không comment đúng sai.",
                        "classroom",
                        List.of("icebreak", "interact", "communicate", "kickoff")
                ),
                game(
                        "Con vật đại diện",
                        "Chọn một con vật cho “version mình lúc họp nhóm” và nói lý do một câu. Chơi ngoài trời nếu tiện.",
                        """
                                1. Leader mẫu: “Mình là mèo hôm nay, vì muốn ngồi im nghe trước”.
                                2. Mỗi người chọn con vật. Không cần độc lạ.
                                3. Nói 1 câu lý do. Leader ghi nhanh lên giấy.
                                4. Không bắt chước tiếng kêu nếu ai ngại.""",
                        6, 5, false, 0,
                        "Không cần chuẩn bị trước. Không gán con vật cho người khác.",
                        "Không đùa theo hướng chế giễu.",
                        "outdoor",
                        List.of("meet", "icebreak", "laugh", "comfort")
                ),
                game(
                        "Tìm người cùng vibe",
                        "Leader nêu 4 vibe; mỗi người chọn 1. Những người cùng vibe đứng lại gần nhau trên campus / hành lang.",
                        """
                                1. Bốn vibe: “muốn nghe”, “muốn nói”, “muốn pha trò”, “muốn vào việc luôn”.
                                2. Mỗi người chọn 1 (giơ số ngón tay).
                                3. Cùng số thì bước lại gần và chào nhau. Không có vibe nào “đúng hơn”.
                                4. Leader điều chỉnh cách họp mặt cho khớp năng lượng nhóm.""",
                        5, 8, false, 0,
                        "Không cần chuẩn bị trước. Giúp nhóm mới không bị ép phải nói nhiều.",
                        "Tôn trọng người chọn “muốn nghe”.",
                        "campus",
                        List.of("icebreak", "comfort", "common", "kickoff")
                )
        );
    }

    private static GameSeed game(
            String name,
            String description,
            String howToPlay,
            int minutes,
            int players,
            boolean preparationRequired,
            int preparationTime,
            String preparation,
            String extraRules,
            String contextSlug,
            List<String> purposeSlugs
    ) {
        return new GameSeed(
                name,
                description,
                howToPlay,
                minutes,
                minutes,
                players,
                players,
                preparationRequired,
                preparationTime,
                preparation,
                extraRules,
                List.of(contextSlug),
                purposeSlugs
        );
    }
}
