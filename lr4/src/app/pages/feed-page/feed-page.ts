import { Component } from '@angular/core';
import { PostCard } from "../../shared/card/post-card/post-card";
import { MatCardTitle, MatCardSubtitle } from "@angular/material/card";

@Component({
  selector: 'app-feed-page',
  imports: [PostCard, MatCardTitle, MatCardSubtitle],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.scss',
})
export class FeedPage {
  protected authorName: string = "Коршков Александр";
  protected postContent: string = "Нами формирования задания курс условий проект уровня показывает порядка соответствующих. Позволяет за богатый нашей выполнять дальнейших финансовых. Следует позиции в выбранный повседневная поэтапного. Забывать проект разнообразный подготовке обеспечивает. Шагов формированию обуславливает качества разработке высшего.";
  protected postImageUrl?: string = "https://material.angular.dev/assets/img/examples/shiba2.jpg";
  protected authorAvatarUrl?: string = "https://material.angular.dev/assets/img/examples/shiba1.jpg";

}
